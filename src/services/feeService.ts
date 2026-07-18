import { FeeReceipt } from '../types';
import { FeeRepository } from '../repositories/FeeRepository';

export const feeService = {
  async getFees(studentId?: string): Promise<FeeReceipt[]> {
    return FeeRepository.getFees(studentId);
  },

  async recordPayment(receipt: Partial<FeeReceipt>): Promise<FeeReceipt> {
    return FeeRepository.recordPayment(receipt);
  },

  async deleteReceipt(id: string): Promise<void> {
    return FeeRepository.deleteReceipt(id);
  },

  async processStudentPayment(paymentData: { studentId: string; amount: number; notes?: string }): Promise<any> {
    return FeeRepository.processStudentPayment(paymentData);
  }
};
