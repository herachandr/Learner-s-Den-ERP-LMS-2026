import { FeeReceipt } from '../types';
import { isFirestoreActive, db, collection, doc, getDocs, setDoc, deleteDoc, query, where } from './base';

export const FeeRepository = {
  async getFees(studentId?: string): Promise<FeeReceipt[]> {
    if (await isFirestoreActive()) {
      try {
        let q = query(collection(db, 'fees'));
        if (studentId) {
          q = query(collection(db, 'fees'), where('studentId', '==', studentId));
        }
        const querySnapshot = await getDocs(q);
        const fees: FeeReceipt[] = [];
        querySnapshot.forEach((doc) => {
          fees.push({ id: doc.id, ...doc.data() } as FeeReceipt);
        });
        return fees;
      } catch (err) {
        console.warn('Firestore getFees failed, falling back to API:', err);
      }
    }

    const url = studentId ? `/api/fees?studentId=${studentId}` : '/api/fees';
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch fee receipts');
    return res.json();
  },

  async recordPayment(receipt: Partial<FeeReceipt>): Promise<FeeReceipt> {
    const id = receipt.id || `receipt-${Date.now()}`;
    const fullReceipt = { ...receipt, id } as FeeReceipt;

    if (await isFirestoreActive()) {
      try {
        await setDoc(doc(db, 'fees', id), fullReceipt);
        // Also update student feeStatus/totalFeesPaid on Firestore
        if (receipt.studentId && receipt.amount) {
          const sRef = doc(db, 'students', receipt.studentId);
          const sDoc = await getDocs(query(collection(db, 'students'), where('id', '==', receipt.studentId)));
          if (!sDoc.empty) {
            const studentData = sDoc.docs[0].data();
            const paid = (studentData.totalFeesPaid || 0) + receipt.amount;
            const due = Math.max(0, (studentData.totalFeesDue || 0) - receipt.amount);
            const status = due === 0 ? 'Paid' : 'Pending';
            await setDoc(sRef, { totalFeesPaid: paid, totalFeesDue: due, feeStatus: status }, { merge: true });
          }
        }
      } catch (err) {
        console.warn('Firestore recordPayment failed:', err);
      }
    }

    const res = await fetch('/api/fees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fullReceipt),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to record fee payment');
    }
    return res.json();
  },

  async deleteReceipt(id: string): Promise<void> {
    if (await isFirestoreActive()) {
      try {
        await deleteDoc(doc(db, 'fees', id));
      } catch (err) {
        console.warn('Firestore deleteReceipt failed:', err);
      }
    }

    const res = await fetch(`/api/fees/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete fee receipt');
  },

  async processStudentPayment(paymentData: { studentId: string; amount: number; notes?: string }): Promise<any> {
    // Standard server payment endpoint maps the payment processor API
    const res = await fetch('/api/student-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Online payment failed');
    }
    const data = await res.json();

    if (await isFirestoreActive()) {
      try {
        if (data.receipt) {
          await setDoc(doc(db, 'fees', data.receipt.id), data.receipt);
        }
      } catch (err) {
        console.warn('Firestore sync for processStudentPayment failed:', err);
      }
    }

    return data;
  }
};
