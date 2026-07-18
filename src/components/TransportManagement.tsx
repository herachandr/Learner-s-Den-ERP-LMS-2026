import React, { useState, useEffect, useRef } from 'react';
import {
  Bus, Navigation, MapPin, User, Clock, ShieldCheck, AlertTriangle, Gauge,
  Wrench, Compass, Database, Activity, FileCode, Send, CheckCircle, XCircle,
  Plus, Trash2, Edit2, Check, RefreshCw, Layers, Map, Info, Wifi, Settings, Globe
} from 'lucide-react';
import { Student } from '../types';

interface TransportManagementProps {
  students: Student[];
  showToast: (title: string, desc: string, type?: 'success' | 'info') => void;
}

interface Vehicle {
  id: string;
  busNo: string;
  model: string;
  capacity: number;
  occupancy: number;
  fuelLevel: number; // percentage
  status: 'Active' | 'Maintenance' | 'Out of Service';
  insuranceExpiry: string;
  lastService: string;
}

interface Stop {
  id: string;
  name: string;
  scheduledTime: string; // e.g. "07:15 AM"
  lat: number;
  lng: number;
  sequence: number;
}

interface Route {
  id: string;
  name: string;
  startPoint: string;
  endPoint: string;
  distance: string; // e.g. "12.5 km"
  estimatedTime: string; // e.g. "45 mins"
  stops: Stop[];
  isActive: boolean;
  busId: string; // Assigned vehicle
}

interface Driver {
  id: string;
  name: string;
  phone: string;
  licenseNo: string;
  licenseExpiry: string;
  shift: 'Morning' | 'Evening' | 'Double Shift';
  status: 'On Duty' | 'Off Duty' | 'On Leave';
  assignedVehicleId: string;
}

interface DriverAttendance {
  id: string;
  driverId: string;
  driverName: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  status: 'Present' | 'Late' | 'Absent';
}

interface StudentBoarding {
  id: string;
  studentId: string;
  studentName: string;
  routeId: string;
  routeName: string;
  stopId: string;
  stopName: string;
  type: 'Boarding' | 'Deboarding';
  timestamp: string;
  status: 'Completed' | 'Missed' | 'Delayed';
}

const INITIAL_VEHICLES: Vehicle[] = [
  { id: 'v1', busNo: 'DL-1PB-4512', model: 'Tata Starbus 40-Seater', capacity: 40, occupancy: 28, fuelLevel: 78, status: 'Active', insuranceExpiry: '2027-04-15', lastService: '2026-06-10' },
  { id: 'v2', busNo: 'DL-1PC-8899', model: 'Eicher Starline 32-Seater', capacity: 32, occupancy: 22, fuelLevel: 45, status: 'Active', insuranceExpiry: '2026-12-01', lastService: '2026-05-22' },
  { id: 'v3', busNo: 'DL-1PD-3044', model: 'Force Traveller 17-Seater', capacity: 17, occupancy: 12, fuelLevel: 92, status: 'Active', insuranceExpiry: '2027-01-20', lastService: '2026-06-28' },
  { id: 'v4', busNo: 'DL-1PE-2250', model: 'Mahindra Cruzio 25-Seater', capacity: 25, occupancy: 0, fuelLevel: 15, status: 'Maintenance', insuranceExpiry: '2026-09-30', lastService: '2026-07-08' },
];

const INITIAL_DRIVERS: Driver[] = [
  { id: 'd1', name: 'Sukhdev Singh', phone: '+91 91122 33445', licenseNo: 'DL-1420100045263', licenseExpiry: '2030-05-14', shift: 'Morning', status: 'On Duty', assignedVehicleId: 'v1' },
  { id: 'd2', name: 'Madan Lal', phone: '+91 91122 55667', licenseNo: 'DL-1420120098523', licenseExpiry: '2029-11-20', shift: 'Double Shift', status: 'On Duty', assignedVehicleId: 'v2' },
  { id: 'd3', name: 'Ramesh Chander', phone: '+91 98877 66554', licenseNo: 'DL-1420150036214', licenseExpiry: '2028-08-01', shift: 'Evening', status: 'Off Duty', assignedVehicleId: 'v3' },
  { id: 'd4', name: 'Gurpreet Singh', phone: '+91 97766 55443', licenseNo: 'DL-1420180011447', licenseExpiry: '2026-07-25', shift: 'Morning', status: 'On Leave', assignedVehicleId: 'v4' },
];

const INITIAL_ROUTES_DATA: Route[] = [
  {
    id: 'r1',
    name: 'Route-A (Vasant Kunj - Saket Circle)',
    startPoint: 'Vasant Kunj Sector D',
    endPoint: 'Saket Metro Station',
    distance: '14.2 km',
    estimatedTime: '45 mins',
    isActive: true,
    busId: 'v1',
    stops: [
      { id: 's1_1', name: 'Vasant Kunj Sector D', scheduledTime: '07:00 AM', lat: 28.5398, lng: 77.1511, sequence: 1 },
      { id: 's1_2', name: 'Kishangarh Village', scheduledTime: '07:12 AM', lat: 28.5321, lng: 77.1620, sequence: 2 },
      { id: 's1_3', name: 'Chhatarpur Mandir Complex', scheduledTime: '07:25 AM', lat: 28.5061, lng: 77.1819, sequence: 3 },
      { id: 's1_4', name: 'Maidan Garhi Crossing', scheduledTime: '07:35 AM', lat: 28.5134, lng: 77.1990, sequence: 4 },
      { id: 's1_5', name: 'Saket Metro Station', scheduledTime: '07:45 AM', lat: 28.5204, lng: 77.2011, sequence: 5 }
    ]
  },
  {
    id: 'r2',
    name: 'Route-B (Dwarka Sec 10 - Janakpuri)',
    startPoint: 'Dwarka Sector 10 Metro',
    endPoint: 'Janakpuri West Block B',
    distance: '11.8 km',
    estimatedTime: '35 mins',
    isActive: true,
    busId: 'v2',
    stops: [
      { id: 's2_1', name: 'Dwarka Sector 10 Metro', scheduledTime: '07:15 AM', lat: 28.5812, lng: 77.0592, sequence: 1 },
      { id: 's2_2', name: 'Dwarka Sector 6 Market', scheduledTime: '07:22 AM', lat: 28.5898, lng: 77.0655, sequence: 2 },
      { id: 's2_3', name: 'Palam Colony Flyover', scheduledTime: '07:33 AM', lat: 28.5925, lng: 77.0851, sequence: 3 },
      { id: 's2_4', name: 'Uttam Nagar East Terminal', scheduledTime: '07:42 AM', lat: 28.6180, lng: 77.0982, sequence: 4 },
      { id: 's2_5', name: 'Janakpuri West Block B', scheduledTime: '07:50 AM', lat: 28.6292, lng: 77.0773, sequence: 5 }
    ]
  },
  {
    id: 'r3',
    name: 'Route-C (Mayur Vihar - Noida Sec 15)',
    startPoint: 'Mayur Vihar Phase 1 Pocket I',
    endPoint: 'Noida Sector 15 Crossing',
    distance: '9.5 km',
    estimatedTime: '25 mins',
    isActive: false,
    busId: 'v3',
    stops: [
      { id: 's3_1', name: 'Mayur Vihar Phase 1 Pocket I', scheduledTime: '07:30 AM', lat: 28.6015, lng: 77.2912, sequence: 1 },
      { id: 's3_2', name: 'Chilla Regulator Village', scheduledTime: '07:40 AM', lat: 28.5951, lng: 77.3025, sequence: 2 },
      { id: 's3_3', name: 'Noida Sector 15 Crossing', scheduledTime: '07:55 AM', lat: 28.5824, lng: 77.3110, sequence: 3 }
    ]
  }
];

const INITIAL_DRIVER_ATTENDANCE: DriverAttendance[] = [
  { id: 'da1', driverId: 'd1', driverName: 'Sukhdev Singh', date: '2026-07-09', checkIn: '06:45 AM', status: 'Present' },
  { id: 'da2', driverId: 'd2', driverName: 'Madan Lal', date: '2026-07-09', checkIn: '07:05 AM', status: 'Late' },
  { id: 'da3', driverId: 'd3', driverName: 'Ramesh Chander', date: '2026-07-08', checkIn: '07:12 AM', checkOut: '04:30 PM', status: 'Present' },
];

const INITIAL_BOARDING_LOGS: StudentBoarding[] = [
  { id: 'sb1', studentId: 'student-1', studentName: 'Aarav Sharma', routeId: 'r1', routeName: 'Route-A', stopId: 's1_2', stopName: 'Kishangarh Village', type: 'Boarding', timestamp: '2026-07-09 07:14 AM', status: 'Completed' },
  { id: 'sb2', studentId: 'student-2', studentName: 'Priya Patel', routeId: 'r2', routeName: 'Route-B', stopId: 's2_3', stopName: 'Palam Colony Flyover', type: 'Boarding', timestamp: '2026-07-09 07:35 AM', status: 'Completed' },
];

export default function TransportManagement({ students, showToast }: TransportManagementProps) {
  const [activeTab, setActiveTab] = useState<'vehicles' | 'routes' | 'drivers' | 'attendance' | 'gps'>('gps');
  
  // Dynamic States
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [drivers, setDrivers] = useState<Driver[]>(INITIAL_DRIVERS);
  const [routes, setRoutes] = useState<Route[]>(INITIAL_ROUTES_DATA);
  const [driverAttendance, setDriverAttendance] = useState<DriverAttendance[]>(INITIAL_DRIVER_ATTENDANCE);
  const [studentBoardingLogs, setStudentBoardingLogs] = useState<StudentBoarding[]>(INITIAL_BOARDING_LOGS);

  // Forms and Interactivity
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [newVehicleForm, setNewVehicleForm] = useState<Partial<Vehicle>>({
    busNo: '', model: '', capacity: 30, fuelLevel: 100, status: 'Active', insuranceExpiry: '2027-01-01', lastService: '2026-07-01'
  });

  const [isAddingDriver, setIsAddingDriver] = useState(false);
  const [newDriverForm, setNewDriverForm] = useState<Partial<Driver>>({
    name: '', phone: '', licenseNo: '', licenseExpiry: '', shift: 'Morning', status: 'Off Duty', assignedVehicleId: ''
  });

  const [isAddingRoute, setIsAddingRoute] = useState(false);
  const [newRouteForm, setNewRouteForm] = useState<{
    name: string; startPoint: string; endPoint: string; distance: string; estimatedTime: string; busId: string; stops: { name: string; scheduledTime: string; lat: number; lng: number }[]
  }>({
    name: '', startPoint: '', endPoint: '', distance: '10 km', estimatedTime: '30 mins', busId: '', stops: []
  });

  const [newStopForm, setNewStopForm] = useState({ name: '', scheduledTime: '07:15 AM', lat: 28.5, lng: 77.1 });
  
  // Boarding logger form
  const [boardingForm, setBoardingForm] = useState({
    studentId: '',
    routeId: 'r1',
    stopId: 's1_1',
    type: 'Boarding' as 'Boarding' | 'Deboarding',
    status: 'Completed' as 'Completed' | 'Missed' | 'Delayed'
  });

  // GPS Live simulation variables
  const [simulatingRouteId, setSimulatingRouteId] = useState<string>('r1');
  const [simulationIndex, setSimulationIndex] = useState<number>(0);
  const [simulationActive, setSimulationActive] = useState<boolean>(false);
  const [gpsLog, setGpsLog] = useState<{ time: string; msg: string; type: 'info' | 'warn' | 'success' }[]>([]);
  const [nmeaLog, setNmeaLog] = useState<string[]>([]);
  const [speed, setSpeed] = useState<number>(0); // km/h
  const [heading, setHeading] = useState<number>(45); // degrees
  const [altitude, setAltitude] = useState<number>(212); // meters

  // Webhook Tester Configuration
  const [webhookUrl, setWebhookUrl] = useState<string>('https://ais-pre-rtilljjtfzrsmf7jv2tjip-972119163555.asia-east1.run.app/api/transport/gps-ingest');
  const [webhookHeaders, setWebhookHeaders] = useState<string>('{\n  "Authorization": "Bearer gps_track_secret_9988",\n  "Content-Type": "application/json"\n}');
  const [webhookLogs, setWebhookLogs] = useState<{ timestamp: string; url: string; payload: string; status: string; response: string }[]>([]);
  const [isSendingWebhook, setIsSendingWebhook] = useState(false);

  // Trigger simulated driving interval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (simulationActive) {
      const activeRoute = routes.find(r => r.id === simulatingRouteId);
      if (activeRoute && activeRoute.stops.length > 0) {
        interval = setInterval(() => {
          setSimulationIndex((prevIndex) => {
            const nextIndex = (prevIndex + 1) % (activeRoute.stops.length * 4); // 4 intermediate steps between each stop
            const stopCount = activeRoute.stops.length;
            const currentStopIdx = Math.floor(nextIndex / 4);
            const subStep = nextIndex % 4;

            const fromStop = activeRoute.stops[currentStopIdx];
            const toStop = activeRoute.stops[(currentStopIdx + 1) % stopCount];

            // Interpolate position
            const ratio = subStep / 4;
            const currentLat = fromStop.lat + (toStop.lat - fromStop.lat) * ratio;
            const currentLng = fromStop.lng + (toStop.lng - fromStop.lng) * ratio;

            // Compute speed and heading
            let currentSpeed = 0;
            if (subStep === 0) {
              currentSpeed = 0; // Stopped at bus stop
            } else {
              currentSpeed = Math.floor(35 + Math.random() * 20);
            }
            setSpeed(currentSpeed);

            const dy = toStop.lat - fromStop.lat;
            const dx = toStop.lng - fromStop.lng;
            const angle = Math.floor((Math.atan2(dy, dx) * 180) / Math.PI);
            setHeading(angle < 0 ? angle + 360 : angle);

            // Mock raw GPS NMEA Strings
            const timestamp = new Date().toISOString();
            const timeFormatted = timestamp.split('T')[1].replace(/Z/, '').substring(0, 8).replace(/:/g, '');
            const rawLat = `${Math.floor(currentLat)}${((currentLat % 1) * 60).toFixed(4)}`;
            const rawLng = `${Math.floor(currentLng)}${((currentLng % 1) * 60).toFixed(4)}`;
            
            // $GPRMC,073215.00,A,2832.3880,N,07709.0660,E,24.5,45.2,090726,,,A*6C
            const gprmc = `$GPRMC,${timeFormatted},A,${rawLat},N,${rawLng},E,${(currentSpeed * 0.5399).toFixed(1)},${angle.toFixed(1)},090726,,,A*4F`;
            // $GPGGA,073215.00,2832.3880,N,07709.0660,E,1,08,1.2,212.0,M,45.0,M,,*66
            const gpgga = `$GPGGA,${timeFormatted},${rawLat},N,${rawLng},E,1,08,1.1,${altitude.toFixed(1)},M,-34.0,M,,*53`;

            setNmeaLog(prev => [gprmc, gpgga, ...prev.slice(0, 20)]);

            // Generate event descriptions
            if (subStep === 0) {
              addGpsLog(`Bus arrived at stop: "${fromStop.name}"`, 'success');
              // Trigger geofence alert
              addGpsLog(`Geofence Alert: Bus [${activeRoute.busId}] entered zone "${fromStop.name}" (Radius: 150m)`, 'info');
              
              // Increment boarding logs mock
              const studentToBoard = students.find(s => s.id === `student-${Math.floor(Math.random() * students.length) + 1}`);
              if (studentToBoard && Math.random() > 0.4) {
                const newBoarding: StudentBoarding = {
                  id: `sb_sim_${Date.now()}`,
                  studentId: studentToBoard.id,
                  studentName: studentToBoard.name,
                  routeId: activeRoute.id,
                  routeName: activeRoute.name.split(' ')[0],
                  stopId: fromStop.id,
                  stopName: fromStop.name,
                  type: Math.random() > 0.5 ? 'Boarding' : 'Deboarding',
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  status: 'Completed'
                };
                setStudentBoardingLogs(prev => [newBoarding, ...prev]);
                showToast("RFID Scan Success", `${studentToBoard.name} has ${newBoarding.type.toLowerCase()}ed the bus at ${fromStop.name}.`, "success");
              }
            } else if (subStep === 3) {
              addGpsLog(`Geofence Alert: Bus [${activeRoute.busId}] exited zone "${fromStop.name}"`, 'warn');
            } else {
              addGpsLog(`GPS Telem PING: Latitude ${currentLat.toFixed(6)}, Longitude ${currentLng.toFixed(6)}, Speed ${currentSpeed} km/h`, 'info');
            }

            // Webhook Simulation if enabled
            if (Math.random() > 0.5) {
              triggerWebhookPost({
                deviceId: activeRoute.busId,
                routeName: activeRoute.name,
                latitude: currentLat,
                longitude: currentLng,
                speed: currentSpeed,
                heading: angle,
                timestamp: timestamp,
                nextStop: toStop.name,
                fuelLevel: 65,
                driver: drivers.find(d => d.assignedVehicleId === activeRoute.busId)?.name || 'Unknown'
              });
            }

            return nextIndex;
          });
        }, 3000);
      }
    }
    return () => clearInterval(interval);
  }, [simulationActive, simulatingRouteId, routes]);

  const addGpsLog = (msg: string, type: 'info' | 'warn' | 'success') => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setGpsLog(prev => [{ time, msg, type }, ...prev.slice(0, 40)]);
  };

  // Simulate Webhook POST Request
  const triggerWebhookPost = async (payloadObj: any) => {
    const timestamp = new Date().toLocaleTimeString();
    const payloadStr = JSON.stringify(payloadObj, null, 2);

    try {
      // Create a mock network request log
      const headersParsed = JSON.parse(webhookHeaders || '{}');
      
      setWebhookLogs(prev => [
        {
          timestamp,
          url: webhookUrl,
          payload: payloadStr,
          status: '202 Accepted (Simulated)',
          response: JSON.stringify({
            status: "success",
            received: true,
            deviceId: payloadObj.deviceId,
            processedAt: new Date().toISOString(),
            geofenceMatched: payloadObj.speed === 0
          }, null, 2)
        },
        ...prev.slice(0, 20)
      ]);
    } catch (e: any) {
      setWebhookLogs(prev => [
        {
          timestamp,
          url: webhookUrl,
          payload: payloadStr,
          status: 'Error',
          response: `Failed to parse Custom Headers JSON: ${e.message}`
        },
        ...prev
      ]);
    }
  };

  // Handle adding a vehicle
  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehicleForm.busNo || !newVehicleForm.model) {
      showToast("Missing Information", "Please specify vehicle plate number and model.", "info");
      return;
    }
    const created: Vehicle = {
      id: `v${vehicles.length + 1}`,
      busNo: newVehicleForm.busNo,
      model: newVehicleForm.model,
      capacity: newVehicleForm.capacity || 30,
      occupancy: 0,
      fuelLevel: newVehicleForm.fuelLevel || 100,
      status: (newVehicleForm.status as any) || 'Active',
      insuranceExpiry: newVehicleForm.insuranceExpiry || '2027-01-01',
      lastService: newVehicleForm.lastService || '2026-07-01'
    };
    setVehicles([...vehicles, created]);
    setIsAddingVehicle(false);
    setNewVehicleForm({ busNo: '', model: '', capacity: 30, fuelLevel: 100, status: 'Active', insuranceExpiry: '2027-01-01', lastService: '2026-07-01' });
    showToast("Vehicle Registered", `Bus ${created.busNo} successfully added to the Institutional fleet!`);
  };

  // Handle adding a driver
  const handleAddDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriverForm.name || !newDriverForm.phone || !newDriverForm.licenseNo) {
      showToast("Missing Information", "Please enter driver name, phone and valid commercial license.", "info");
      return;
    }
    const created: Driver = {
      id: `d${drivers.length + 1}`,
      name: newDriverForm.name,
      phone: newDriverForm.phone,
      licenseNo: newDriverForm.licenseNo,
      licenseExpiry: newDriverForm.licenseExpiry || '2028-12-31',
      shift: newDriverForm.shift as any || 'Morning',
      status: newDriverForm.status as any || 'Off Duty',
      assignedVehicleId: newDriverForm.assignedVehicleId || ''
    };
    setDrivers([...drivers, created]);
    setIsAddingDriver(false);
    setNewDriverForm({ name: '', phone: '', licenseNo: '', licenseExpiry: '', shift: 'Morning', status: 'Off Duty', assignedVehicleId: '' });
    showToast("Driver Recruited", `Driver "${created.name}" registered and commercial driver license logged.`);
  };

  // Handle adding a route
  const handleAddRoute = () => {
    if (!newRouteForm.name || !newRouteForm.startPoint || !newRouteForm.endPoint) {
      showToast("Missing Fields", "Please populate name, start and end stations.", "info");
      return;
    }
    const created: Route = {
      id: `r${routes.length + 1}`,
      name: newRouteForm.name,
      startPoint: newRouteForm.startPoint,
      endPoint: newRouteForm.endPoint,
      distance: newRouteForm.distance,
      estimatedTime: newRouteForm.estimatedTime,
      isActive: true,
      busId: newRouteForm.busId || 'v1',
      stops: newRouteForm.stops.map((st, i) => ({
        id: `s_new_${routes.length + 1}_${i}`,
        name: st.name,
        scheduledTime: st.scheduledTime,
        lat: st.lat,
        lng: st.lng,
        sequence: i + 1
      }))
    };
    setRoutes([...routes, created]);
    setIsAddingRoute(false);
    setNewRouteForm({ name: '', startPoint: '', endPoint: '', distance: '10 km', estimatedTime: '30 mins', busId: '', stops: [] });
    showToast("Route Created", `"${created.name}" configured with ${created.stops.length} designated pick-up stops.`);
  };

  // Handle driver check-in
  const handleDriverCheckIn = (driverId: string) => {
    const dr = drivers.find(d => d.id === driverId);
    if (!dr) return;
    
    // Check if already checked in today
    const exists = driverAttendance.some(da => da.driverId === driverId && da.date === '2026-07-09');
    if (exists) {
      showToast("Already Registered", `${dr.name} has already checked in today.`, "info");
      return;
    }

    const newAttendance: DriverAttendance = {
      id: `da_${Date.now()}`,
      driverId,
      driverName: dr.name,
      date: '2026-07-09',
      checkIn: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: new Date().getHours() > 8 ? 'Late' : 'Present'
    };

    setDriverAttendance([newAttendance, ...driverAttendance]);
    setDrivers(drivers.map(d => d.id === driverId ? { ...d, status: 'On Duty' } : d));
    showToast("Check-In Success", `Driver ${dr.name} is now logged On Duty at ${newAttendance.checkIn}.`);
  };

  // Handle manual boarding record
  const handleBoardingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!boardingForm.studentId) {
      showToast("Error", "Please select a student borrower first", "info");
      return;
    }
    const studentObj = students.find(s => s.id === boardingForm.studentId);
    const routeObj = routes.find(r => r.id === boardingForm.routeId);
    const stopObj = routeObj?.stops.find(s => s.id === boardingForm.stopId);

    const log: StudentBoarding = {
      id: `sb_${Date.now()}`,
      studentId: boardingForm.studentId,
      studentName: studentObj?.name || 'Unknown Student',
      routeId: boardingForm.routeId,
      routeName: routeObj?.name.split(' ')[0] || 'Unknown Route',
      stopId: boardingForm.stopId,
      stopName: stopObj?.name || 'Unknown Stop',
      type: boardingForm.type,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: boardingForm.status
    };

    setStudentBoardingLogs([log, ...studentBoardingLogs]);
    showToast("Boarding Logged", `Successfully registered ${log.type} of ${log.studentName} at ${log.stopName}.`);
  };

  // Get stops for currently selected boarding form route
  const boardingStops = routes.find(r => r.id === boardingForm.routeId)?.stops || [];

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 text-left" id="transport-management-root">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Bus className="h-6 w-6 text-indigo-600" />
            Learner's Den Transport & GPS Fleet Console
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Supervise vehicles, map custom routes, sequences of stops, register active drivers, track boarding logs, and trigger live telematics tests.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="text-[11px] font-black bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Telemetry: Online
          </span>
          <span className="text-[11px] font-black bg-slate-100 text-slate-600 px-3 py-1.5 rounded-xl border border-slate-200">
            🗓️ System Date: <strong className="text-slate-800">2026-07-09</strong>
          </span>
        </div>
      </div>

      {/* Quick Dashboard Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-1">
          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Total Fleet</span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-black text-slate-800">{vehicles.length}</span>
            <span className="text-xxs text-slate-400 font-bold">buses</span>
            <span className="text-[10px] font-bold text-emerald-600 ml-1">({vehicles.filter(v => v.status === 'Active').length} Active)</span>
          </div>
        </div>

        <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-1">
          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Coaching Routes</span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-black text-indigo-600">{routes.length}</span>
            <span className="text-xxs text-slate-400 font-bold">configured</span>
            <span className="text-[10px] font-bold text-indigo-500 ml-1">({routes.reduce((acc, r) => acc + r.stops.length, 0)} stops)</span>
          </div>
        </div>

        <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-1">
          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Duty Drivers</span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-black text-slate-800">
              {drivers.filter(d => d.status === 'On Duty').length}
            </span>
            <span className="text-xxs text-slate-400 font-bold">on wheel</span>
            <span className="text-[10px] font-bold text-amber-600 ml-1">({drivers.filter(d => d.status === 'On Leave').length} Leave)</span>
          </div>
        </div>

        <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-1">
          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Boarding Logins</span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-black text-indigo-600">{studentBoardingLogs.length}</span>
            <span className="text-xxs text-slate-400 font-bold">swipes today</span>
          </div>
        </div>

        <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 col-span-2 lg:col-span-1 space-y-1">
          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">GPS Stream Rate</span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-black text-slate-800">{simulationActive ? '3.0s' : 'Halted'}</span>
            <span className="text-xxs text-slate-400 font-bold">interval</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto scrollbar-none pb-px">
        {[
          { id: 'gps', label: 'Live GPS Simulator & Telemetry', icon: Compass },
          { id: 'vehicles', label: 'Vehicles & Fleet', icon: Bus },
          { id: 'routes', label: 'Routes & Stop Sequences', icon: Navigation },
          { id: 'drivers', label: 'Registered Drivers', icon: User },
          { id: 'attendance', label: 'Attendance & Boarding Ledger', icon: Activity }
        ].map(tab => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              id={`transport-tab-btn-${tab.id}`}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600 font-black'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <TabIcon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab: GPS Telemetry and Webhook Simulator */}
      {activeTab === 'gps' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Live Map / Progress Panel */}
            <div className="xl:col-span-7 space-y-4">
              <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-4 text-left">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Map className="h-4 w-4 text-indigo-600" />
                      Visual Route Sequence Map
                    </h3>
                    <p className="text-[10px] text-slate-400 font-semibold">Select an active route below to initiate a real-time cellular telemetry test.</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={simulatingRouteId}
                      onChange={(e) => {
                        setSimulatingRouteId(e.target.value);
                        setSimulationIndex(0);
                        addGpsLog(`Switched simulator target to route: ${e.target.value}`, 'info');
                      }}
                      className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-xxs font-black text-indigo-900 focus:outline-indigo-500"
                    >
                      {routes.filter(r => r.isActive).map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>

                    <button
                      onClick={() => setSimulationActive(!simulationActive)}
                      id="gps-simulation-toggle-btn"
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        simulationActive
                          ? 'bg-rose-600 text-white hover:bg-rose-700'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      {simulationActive ? (
                        <>
                          <Wifi className="h-3 w-3 animate-ping" /> Stop Feed
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-3 w-3" /> Start GPS simulation
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Simulated Geolocation HUD */}
                <div className="grid grid-cols-4 gap-2 bg-slate-900 border border-slate-850 p-4 rounded-xl font-mono text-center text-emerald-400">
                  <div className="space-y-0.5 border-r border-slate-800">
                    <span className="text-[8px] text-slate-400 uppercase tracking-widest font-sans font-bold">Speedometer</span>
                    <span className="text-base font-black flex items-baseline justify-center gap-0.5">
                      {simulationActive ? speed : 0} <span className="text-[9px] text-emerald-500 font-sans">km/h</span>
                    </span>
                  </div>
                  <div className="space-y-0.5 border-r border-slate-800">
                    <span className="text-[8px] text-slate-400 uppercase tracking-widest font-sans font-bold">Compass Head</span>
                    <span className="text-base font-black">
                      {simulationActive ? `${heading}°` : '---'}
                    </span>
                  </div>
                  <div className="space-y-0.5 border-r border-slate-800">
                    <span className="text-[8px] text-slate-400 uppercase tracking-widest font-sans font-bold">Altitude</span>
                    <span className="text-base font-black">
                      {simulationActive ? `${altitude}m` : '---'}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[8px] text-slate-400 uppercase tracking-widest font-sans font-bold">GPS Satellites</span>
                    <span className="text-base font-black">09 (Fix 3D)</span>
                  </div>
                </div>

                {/* Animated Interactive Map Visualizer */}
                <div className="relative border border-slate-200 bg-slate-50 rounded-2xl p-6 overflow-hidden min-h-[220px] flex flex-col justify-between">
                  {/* Grid Lines Pattern */}
                  <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_24px]" />
                  
                  {/* Outer Frame Label */}
                  <div className="relative z-10 flex justify-between items-center">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
                      🗺️ Delhi NCR Regional Geo-Boundary
                    </span>
                    <span className="text-[9px] font-bold text-slate-500">Scale: 1 : 20,000</span>
                  </div>

                  {/* Stops Sequence Progress bar */}
                  <div className="relative z-10 my-8">
                    {/* Linear Route Connector Line */}
                    <div className="absolute top-1/2 left-4 right-4 h-1 bg-slate-200 -translate-y-1/2 rounded" />
                    
                    {/* Progress Fill if Simulating */}
                    {simulationActive && (
                      <div 
                        className="absolute top-1/2 left-4 h-1 bg-indigo-500 -translate-y-1/2 rounded transition-all duration-1000" 
                        style={{ 
                          width: `${Math.min(100, (simulationIndex / (routes.find(r => r.id === simulatingRouteId)!.stops.length * 4)) * 100)}%` 
                        }}
                      />
                    )}

                    <div className="relative flex justify-between">
                      {routes.find(r => r.id === simulatingRouteId)?.stops.map((stop, i) => {
                        const totalSteps = routes.find(r => r.id === simulatingRouteId)!.stops.length * 4;
                        const curStepGroup = Math.floor(simulationIndex / 4);
                        const isVisited = i < curStepGroup;
                        const isCurrent = i === curStepGroup;

                        return (
                          <div key={stop.id} className="flex flex-col items-center space-y-2 relative">
                            {/* Circle Dot Stop */}
                            <div 
                              className={`h-7 w-7 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 cursor-pointer ${
                                isCurrent && simulationActive
                                  ? 'bg-indigo-600 border-indigo-200 text-white shadow-md scale-110'
                                  : isVisited && simulationActive
                                  ? 'bg-indigo-50 border-indigo-500 text-indigo-600'
                                  : 'bg-white border-slate-300 text-slate-400'
                              }`}
                              title={`${stop.name} (${stop.scheduledTime})`}
                            >
                              <span className="text-[10px] font-black">{stop.sequence}</span>
                            </div>

                            {/* Tooltip Stop Label */}
                            <div className="text-center w-24">
                              <span className="text-[9px] font-black text-slate-800 block line-clamp-1">{stop.name}</span>
                              <span className="text-[8px] text-slate-450 font-bold block">{stop.scheduledTime}</span>
                            </div>

                            {/* Latitude / Longitude Telemetry underneath */}
                            <div className="absolute top-12 whitespace-nowrap text-[8px] font-mono font-bold text-indigo-600 bg-white border border-slate-150 px-1 py-0.5 rounded">
                              {stop.lat.toFixed(3)}N, {stop.lng.toFixed(3)}E
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center border-t border-slate-200 pt-3 text-[10px] font-bold text-slate-500 gap-2">
                    <div>
                      ⚡ Next Landmark Estimate: <span className="text-indigo-600 font-extrabold">
                        {(() => {
                          const route = routes.find(r => r.id === simulatingRouteId);
                          if (!route) return 'None';
                          const curIndex = Math.min(route.stops.length - 1, Math.floor(simulationIndex / 4) + 1);
                          return `"${route.stops[curIndex].name}" at ${route.stops[curIndex].scheduledTime}`;
                        })()}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[9px] font-mono">
                        LAT: {routes.find(r => r.id === simulatingRouteId)?.stops[Math.floor(simulationIndex / 4)]?.lat.toFixed(5) || '28.5398'}
                      </span>
                      <span className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[9px] font-mono">
                        LNG: {routes.find(r => r.id === simulatingRouteId)?.stops[Math.floor(simulationIndex / 4)]?.lng.toFixed(5) || '77.1511'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Telematics Event Logger */}
              <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1">
                    <span>📡</span> Live Telemetry Terminal
                  </h3>
                  <button 
                    onClick={() => setGpsLog([])}
                    className="text-[10px] font-bold text-rose-500 hover:underline hover:text-rose-600"
                  >
                    Clear Terminal Logs
                  </button>
                </div>

                <div className="h-[180px] overflow-y-auto bg-slate-950 p-4 rounded-xl font-mono text-[10px] text-slate-300 space-y-1.5 scrollbar-thin">
                  {gpsLog.length === 0 ? (
                    <div className="text-slate-500 text-center py-10">
                      Telemetry inactive. Please press "Start GPS simulation" above to receive cellular raw pings.
                    </div>
                  ) : (
                    gpsLog.map((log, idx) => (
                      <div key={idx} className="flex gap-2 leading-relaxed">
                        <span className="text-slate-550 font-bold">[{log.time}]</span>
                        <span className={`flex-1 ${
                          log.type === 'success' ? 'text-emerald-400 font-bold' :
                          log.type === 'warn' ? 'text-amber-400' : 'text-cyan-400'
                        }`}>
                          {log.msg}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Panel: Webhook Configurations & Raw NMEA Payloads */}
            <div className="xl:col-span-5 space-y-6">
              {/* External GPS Webhook Simulator */}
              <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Globe className="h-4 w-4 text-emerald-600" />
                    GPS Webhook Integration
                  </h3>
                  <p className="text-[10px] text-slate-400 font-semibold">Simulate sending cellular vehicle telemetry packets to third-party school dashboards or parent apps.</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[9px] font-black text-slate-500 uppercase mb-1">Target Webhook Endpoint URL</label>
                    <input
                      type="url"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xxs font-mono text-slate-800 focus:outline-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-black text-slate-500 uppercase mb-1">Custom Auth / Payload Headers</label>
                    <textarea
                      rows={3}
                      value={webhookHeaders}
                      onChange={(e) => setWebhookHeaders(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xxs font-mono text-slate-700 focus:outline-indigo-500"
                    />
                  </div>

                  <div className="pt-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Live Endpoint Response Console</span>
                    <div className="bg-slate-900 text-slate-300 font-mono text-[9px] p-3 rounded-xl max-h-[140px] overflow-y-auto whitespace-pre space-y-2 border border-slate-850">
                      {webhookLogs.length === 0 ? (
                        <span className="text-slate-500 font-semibold">No requests dispatched yet. Webhook posts are simulated during route motion.</span>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex justify-between text-indigo-400 font-bold border-b border-slate-800 pb-1">
                            <span>HTTP POST dispatched</span>
                            <span>{webhookLogs[0].timestamp}</span>
                          </div>
                          <div>URL: <span className="text-slate-400">{webhookLogs[0].url}</span></div>
                          <div className="text-amber-300">Payload Sample: {webhookLogs[0].payload.slice(0, 150)}...</div>
                          <div className="text-emerald-400">Response Status: {webhookLogs[0].status}</div>
                          <div className="text-slate-400 font-medium">Server Body: {webhookLogs[0].response}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Raw NMEA Sentence Logger (GPS Hardware Standard) */}
              <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-3">
                <div className="space-y-1">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <FileCode className="h-4 w-4 text-indigo-600" />
                    NMEA-0183 Telemetry Stream
                  </h3>
                  <p className="text-[10px] text-slate-400 font-semibold">
                    Simulate real hardware raw logs emitted from onboard GPS devices ($GPRMC and $GPGGA sentences) for hardware integration.
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl font-mono text-[9px] text-indigo-400 space-y-1 max-h-[160px] overflow-y-auto">
                  {nmeaLog.length === 0 ? (
                    <div className="text-slate-600 text-center py-6 font-sans font-bold">
                      Raw NMEA buffer empty. Start active simulation to feed.
                    </div>
                  ) : (
                    nmeaLog.map((sentence, idx) => (
                      <div key={idx} className="hover:bg-slate-900 px-1 py-0.5 rounded">
                        {sentence}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Vehicles & Fleet */}
      {activeTab === 'vehicles' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Fleet Registry & Compliance Tracker</h3>
              <p className="text-xxs text-slate-400 font-semibold">Configure bus models, capacities, fuel ratings, and monitor legal insurance deadlines.</p>
            </div>
            <button
              onClick={() => setIsAddingVehicle(!isAddingVehicle)}
              id="add-vehicle-btn"
              className="flex items-center gap-1.5 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Register Vehicle
            </button>
          </div>

          {/* Form to add vehicle */}
          {isAddingVehicle && (
            <form onSubmit={handleAddVehicle} className="border border-indigo-150 bg-indigo-50/10 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h4 className="text-xs font-black text-indigo-900 uppercase">Onboard New Fleet Bus</h4>
                <button type="button" onClick={() => setIsAddingVehicle(false)} className="text-slate-400 hover:text-slate-600">
                  <XCircle className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase mb-1">Registration Plate (License No)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DL-1PB-9944"
                    value={newVehicleForm.busNo}
                    onChange={(e) => setNewVehicleForm({ ...newVehicleForm, busNo: e.target.value })}
                    className="w-full bg-white border border-slate-250 rounded-xl p-2 text-xs text-slate-800 font-semibold focus:outline-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase mb-1">Bus Model Manufacturer</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ashok Leyland 40S"
                    value={newVehicleForm.model}
                    onChange={(e) => setNewVehicleForm({ ...newVehicleForm, model: e.target.value })}
                    className="w-full bg-white border border-slate-250 rounded-xl p-2 text-xs text-slate-800 font-semibold focus:outline-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase mb-1">Maximum Seating Capacity</label>
                  <input
                    type="number"
                    min="5"
                    max="80"
                    value={newVehicleForm.capacity}
                    onChange={(e) => setNewVehicleForm({ ...newVehicleForm, capacity: parseInt(e.target.value) || 30 })}
                    className="w-full bg-white border border-slate-250 rounded-xl p-2 text-xs text-slate-800 font-semibold focus:outline-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase mb-1">Insurance Expiration Date</label>
                  <input
                    type="date"
                    value={newVehicleForm.insuranceExpiry}
                    onChange={(e) => setNewVehicleForm({ ...newVehicleForm, insuranceExpiry: e.target.value })}
                    className="w-full bg-white border border-slate-250 rounded-xl p-2 text-xs text-slate-800 font-semibold focus:outline-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingVehicle(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Save Fleet Record
                </button>
              </div>
            </form>
          )}

          {/* Vehicles Fleet Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {vehicles.map(v => (
              <div key={v.id} className="border border-slate-200 rounded-2xl p-5 bg-white space-y-4 hover:shadow-xs transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-black text-slate-800 font-mono tracking-tight bg-slate-100 border border-slate-200 px-2 py-1 rounded-lg">
                      {v.busNo}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${
                      v.status === 'Active' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' :
                      v.status === 'Maintenance' ? 'bg-amber-50 border-amber-200 text-amber-600' :
                      'bg-rose-50 border-rose-200 text-rose-600'
                    }`}>
                      {v.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-black text-slate-850">{v.model}</h4>
                    <span className="text-[10px] text-slate-400 font-bold block">Capacity Limit: {v.capacity} kids</span>
                  </div>

                  {/* Fuel Tank Level gauge */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[9px] font-bold text-slate-450 uppercase">
                      <span>Fuel Reservoir</span>
                      <span className={v.fuelLevel < 25 ? 'text-rose-500 font-black' : 'text-slate-700'}>{v.fuelLevel}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          v.fuelLevel < 25 ? 'bg-rose-500' : v.fuelLevel < 60 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${v.fuelLevel}%` }}
                      />
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3 space-y-1 text-[10px] text-slate-450 font-bold">
                    <div className="flex justify-between">
                      <span>Last Inspected:</span>
                      <span className="text-slate-700">{v.lastService}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Insurance Policy:</span>
                      <span className={`font-mono ${new Date(v.insuranceExpiry) < new Date('2026-07-09') ? 'text-rose-500 font-black' : 'text-slate-700'}`}>
                        {v.insuranceExpiry}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-slate-100 pt-3 mt-2">
                  <button
                    onClick={() => {
                      const nextStatus = v.status === 'Active' ? 'Maintenance' : v.status === 'Maintenance' ? 'Out of Service' : 'Active';
                      setVehicles(vehicles.map(bus => bus.id === v.id ? { ...bus, status: nextStatus } : bus));
                      showToast("Status Switched", `${v.busNo} changed to status: ${nextStatus}`);
                    }}
                    className="px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-[9px] font-black border border-slate-200 cursor-pointer"
                  >
                    Cycle Status
                  </button>
                  <button
                    onClick={() => {
                      setVehicles(vehicles.filter(bus => bus.id !== v.id));
                      showToast("Fleet Retired", `${v.busNo} decommissioned from database.`);
                    }}
                    className="p-1 hover:bg-rose-50 text-rose-500 hover:text-rose-600 rounded-lg cursor-pointer"
                    title="Delete vehicle record"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Routes & Stops */}
      {activeTab === 'routes' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Coaching Route Sequencer</h3>
              <p className="text-xxs text-slate-400 font-semibold">Review stops sequence schedules, geographical distances, and allocated fleet buses.</p>
            </div>
            <button
              onClick={() => setIsAddingRoute(!isAddingRoute)}
              id="add-route-btn"
              className="flex items-center gap-1.5 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Configure Route
            </button>
          </div>

          {/* Create new route card */}
          {isAddingRoute && (
            <div className="border border-indigo-150 bg-indigo-50/10 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-150 pb-2">
                <h4 className="text-xs font-black text-indigo-900 uppercase">Define New Transport Pathway</h4>
                <button onClick={() => setIsAddingRoute(false)} className="text-slate-400 hover:text-slate-600">
                  <XCircle className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase mb-1">Route Descriptor Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Route-D (Noida Sector 62 - Indirapuram)"
                    value={newRouteForm.name}
                    onChange={(e) => setNewRouteForm({ ...newRouteForm, name: e.target.value })}
                    className="w-full bg-white border border-slate-250 rounded-xl p-2 text-xs text-slate-800 font-semibold focus:outline-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase mb-1">Start Hub Terminal</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Noida Sec 62 Metro"
                    value={newRouteForm.startPoint}
                    onChange={(e) => setNewRouteForm({ ...newRouteForm, startPoint: e.target.value })}
                    className="w-full bg-white border border-slate-250 rounded-xl p-2 text-xs text-slate-800 font-semibold focus:outline-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase mb-1">End Hub Terminal</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jaipuria Mall Complex"
                    value={newRouteForm.endPoint}
                    onChange={(e) => setNewRouteForm({ ...newRouteForm, endPoint: e.target.value })}
                    className="w-full bg-white border border-slate-250 rounded-xl p-2 text-xs text-slate-800 font-semibold focus:outline-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase mb-1">Assigned Fleet Vehicle</label>
                  <select
                    value={newRouteForm.busId}
                    onChange={(e) => setNewRouteForm({ ...newRouteForm, busId: e.target.value })}
                    className="w-full bg-white border border-slate-250 rounded-xl p-2 text-xs text-slate-800 font-semibold focus:outline-indigo-500"
                  >
                    <option value="">Select bus...</option>
                    {vehicles.filter(v => v.status === 'Active').map(v => (
                      <option key={v.id} value={v.id}>{v.busNo} ({v.model})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase mb-1">Total Route Distance Estimate</label>
                  <input
                    type="text"
                    value={newRouteForm.distance}
                    onChange={(e) => setNewRouteForm({ ...newRouteForm, distance: e.target.value })}
                    className="w-full bg-white border border-slate-250 rounded-xl p-2 text-xs text-slate-800 font-semibold focus:outline-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase mb-1">Est. Travel Time Duration</label>
                  <input
                    type="text"
                    value={newRouteForm.estimatedTime}
                    onChange={(e) => setNewRouteForm({ ...newRouteForm, estimatedTime: e.target.value })}
                    className="w-full bg-white border border-slate-250 rounded-xl p-2 text-xs text-slate-800 font-semibold focus:outline-indigo-500"
                  />
                </div>
              </div>

              {/* Stop Builders Inside route config */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-700 uppercase">Construct Stops Sequence</span>
                  <span className="text-[10px] text-indigo-600 font-bold">{newRouteForm.stops.length} configured stops</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Stop name (e.g. Sector 5 Crossing)"
                    value={newStopForm.name}
                    onChange={(e) => setNewStopForm({ ...newStopForm, name: e.target.value })}
                    className="bg-white border border-slate-200 rounded-lg p-2 text-xxs font-semibold"
                  />
                  <input
                    type="text"
                    placeholder="Schedule (e.g. 07:25 AM)"
                    value={newStopForm.scheduledTime}
                    onChange={(e) => setNewStopForm({ ...newStopForm, scheduledTime: e.target.value })}
                    className="bg-white border border-slate-200 rounded-lg p-2 text-xxs font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newStopForm.name) return;
                      setNewRouteForm({
                        ...newRouteForm,
                        stops: [...newRouteForm.stops, { 
                          name: newStopForm.name, 
                          scheduledTime: newStopForm.scheduledTime, 
                          lat: 28.5 + (Math.random() - 0.5) * 0.1, 
                          lng: 77.1 + (Math.random() - 0.5) * 0.1 
                        }]
                      });
                      setNewStopForm({ name: '', scheduledTime: '07:15 AM', lat: 28.5, lng: 77.1 });
                    }}
                    className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xxs font-bold p-2 cursor-pointer"
                  >
                    Add Stop
                  </button>
                </div>

                {newRouteForm.stops.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {newRouteForm.stops.map((st, sidx) => (
                      <span key={sidx} className="bg-white border border-slate-200 rounded px-2 py-1 text-[9px] font-bold text-slate-600 flex items-center gap-1">
                        🏁 Stop {sidx + 1}: {st.name} ({st.scheduledTime})
                        <button
                          type="button"
                          onClick={() => setNewRouteForm({ ...newRouteForm, stops: newRouteForm.stops.filter((_, idx) => idx !== sidx) })}
                          className="text-rose-500 hover:text-rose-700 font-extrabold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddingRoute(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddRoute}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Save Pathway
                </button>
              </div>
            </div>
          )}

          {/* Routes Table List */}
          {routes.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 flex flex-col items-center justify-center">
              <Bus className="h-10 w-10 text-slate-300 mb-2" />
              <p className="text-xs text-slate-500 font-black">No transport routes configured yet.</p>
              <p className="text-[10px] text-slate-400 mt-0.5 mb-4">Set up transport paths, pick-up stops, and map GPS coordinate checkpoints.</p>
              <button
                onClick={() => setIsAddingRoute(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xxs font-black rounded-xl transition-all cursor-pointer shadow-3xs uppercase tracking-wider"
              >
                + Configure New Route
              </button>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden">
              <table className="w-full text-xs text-slate-600 text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-[9px] font-black uppercase tracking-wider text-slate-450">
                  <tr>
                    <th className="p-3">Route Descriptive</th>
                    <th className="p-3">Stations Bound</th>
                    <th className="p-3">Assigned Vehicle</th>
                    <th className="p-3 text-center">Stops Count</th>
                    <th className="p-3 text-right">Distance / Duration</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {routes.map(r => {
                    const assignedBus = vehicles.find(v => v.id === r.busId);
                    return (
                      <tr key={r.id} className="hover:bg-slate-50/50">
                        <td className="p-3">
                          <span className="font-black text-slate-800 block">{r.name}</span>
                          <span className="text-[10px] text-indigo-500 font-extrabold">ID: {r.id.toUpperCase()}</span>
                        </td>
                        <td className="p-3 text-slate-700">
                          <div className="flex items-center gap-1 font-bold">
                            <span className="text-xxs uppercase text-slate-400">From</span> {r.startPoint}
                          </div>
                          <div className="flex items-center gap-1 font-bold mt-0.5">
                            <span className="text-xxs uppercase text-slate-400">To</span> {r.endPoint}
                          </div>
                        </td>
                        <td className="p-3">
                          {assignedBus ? (
                            <div className="space-y-0.5">
                              <span className="font-mono font-black text-slate-800 bg-slate-100 border border-slate-200 rounded-md px-1.5 py-0.5 text-xxs">
                                {assignedBus.busNo}
                              </span>
                              <span className="text-[9px] text-slate-400 block font-bold">{assignedBus.model}</span>
                            </div>
                          ) : (
                            <span className="text-xxs text-amber-600 font-extrabold">🚨 No Bus assigned</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <span className="bg-indigo-50 text-indigo-700 border border-indigo-150 px-2.5 py-1 rounded-full text-xxs font-black">
                            {r.stops.length} designated
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <span className="font-black text-slate-850 block">{r.distance}</span>
                          <span className="text-xxs text-slate-400 font-bold block">{r.estimatedTime}</span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                            r.isActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-150' : 'bg-slate-50 text-slate-500 border border-slate-150'
                          }`}>
                            {r.isActive ? 'Active' : 'Draft/Suspended'}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => {
                                setRoutes(routes.map(pathway => pathway.id === r.id ? { ...pathway, isActive: !pathway.isActive } : pathway));
                                showToast("Route status toggled", `${r.name} status updated.`);
                              }}
                              className="p-1 hover:bg-slate-100 text-slate-500 rounded-lg cursor-pointer"
                              title="Toggle active status"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setRoutes(routes.filter(pathway => pathway.id !== r.id));
                                showToast("Route Deleted", `${r.name} removed from sequencer.`);
                              }}
                              className="p-1 hover:bg-rose-50 text-rose-500 rounded-lg cursor-pointer"
                              title="Deconfigure route"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab: Registered Drivers */}
      {activeTab === 'drivers' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Driver Licensure & Shift Duty Roster</h3>
              <p className="text-xxs text-slate-400 font-semibold">Monitor heavy-vehicle license expiries, assign dedicated buses, and log daily shifts.</p>
            </div>
            <button
              onClick={() => setIsAddingDriver(!isAddingDriver)}
              id="add-driver-btn"
              className="flex items-center gap-1.5 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Recruit Driver
            </button>
          </div>

          {/* Form to recruit driver */}
          {isAddingDriver && (
            <form onSubmit={handleAddDriver} className="border border-indigo-150 bg-indigo-50/10 rounded-2xl p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h4 className="text-xs font-black text-indigo-900 uppercase">Register New Transport Operator</h4>
                <button type="button" onClick={() => setIsAddingDriver(false)} className="text-slate-400 hover:text-slate-600">
                  <XCircle className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase mb-1">Full Driver Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jaswant Singh"
                    value={newDriverForm.name}
                    onChange={(e) => setNewDriverForm({ ...newDriverForm, name: e.target.value })}
                    className="w-full bg-white border border-slate-250 rounded-xl p-2 text-xs text-slate-800 font-semibold focus:outline-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase mb-1">Mobile WhatsApp Phone</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 94455 11223"
                    value={newDriverForm.phone}
                    onChange={(e) => setNewDriverForm({ ...newDriverForm, phone: e.target.value })}
                    className="w-full bg-white border border-slate-250 rounded-xl p-2 text-xs text-slate-800 font-semibold focus:outline-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase mb-1">Commercial License Number (HTV)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DL-142022003551"
                    value={newDriverForm.licenseNo}
                    onChange={(e) => setNewDriverForm({ ...newDriverForm, licenseNo: e.target.value })}
                    className="w-full bg-white border border-slate-250 rounded-xl p-2 text-xs text-slate-800 font-semibold focus:outline-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase mb-1">License Validity Date</label>
                  <input
                    type="date"
                    value={newDriverForm.licenseExpiry}
                    onChange={(e) => setNewDriverForm({ ...newDriverForm, licenseExpiry: e.target.value })}
                    className="w-full bg-white border border-slate-250 rounded-xl p-2 text-xs text-slate-800 font-semibold focus:outline-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase mb-1">Assigned Vehicle Bus</label>
                  <select
                    value={newDriverForm.assignedVehicleId}
                    onChange={(e) => setNewDriverForm({ ...newDriverForm, assignedVehicleId: e.target.value })}
                    className="w-full bg-white border border-slate-250 rounded-xl p-2 text-xs text-slate-800 font-semibold focus:outline-indigo-500"
                  >
                    <option value="">None / Backup pool</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.busNo} ({v.model})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-500 uppercase mb-1">Duty Shift Segment</label>
                  <select
                    value={newDriverForm.shift}
                    onChange={(e) => setNewDriverForm({ ...newDriverForm, shift: e.target.value as any })}
                    className="w-full bg-white border border-slate-250 rounded-xl p-2 text-xs text-slate-800 font-semibold focus:outline-indigo-500"
                  >
                    <option value="Morning">Morning (06:00 AM - 02:00 PM)</option>
                    <option value="Evening">Evening (02:00 PM - 10:00 PM)</option>
                    <option value="Double Shift">Double Shift Duty</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddingDriver(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Approve Registration
                </button>
              </div>
            </form>
          )}

          {/* Drivers Grid List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {drivers.map(d => {
              const bus = vehicles.find(v => v.id === d.assignedVehicleId);
              const isLicenseExpired = new Date(d.licenseExpiry) < new Date('2026-07-09');

              return (
                <div key={d.id} className="border border-slate-200 rounded-2xl p-5 bg-white space-y-4 hover:shadow-xs transition-all flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-indigo-50 text-indigo-700 font-black flex items-center justify-center rounded-full text-xs">
                          {d.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-800 leading-none">{d.name}</h4>
                          <span className="text-[9px] text-slate-400 font-bold block mt-1">{d.phone}</span>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${
                        d.status === 'On Duty' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' :
                        d.status === 'Off Duty' ? 'bg-slate-50 border-slate-200 text-slate-500' :
                        'bg-rose-50 border-rose-200 text-rose-600'
                      }`}>
                        {d.status}
                      </span>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-3 space-y-1 text-xxs text-slate-550 font-semibold">
                      <div className="flex justify-between">
                        <span>Commercial License:</span>
                        <span className="font-mono font-black text-slate-700">{d.licenseNo.substring(0, 10)}...</span>
                      </div>
                      <div className="flex justify-between">
                        <span>License Expiry:</span>
                        <span className={`font-mono font-black ${isLicenseExpired ? 'text-rose-500 animate-pulse' : 'text-slate-700'}`}>
                          {d.licenseExpiry}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Assigned Bus:</span>
                        <span className="text-slate-700 font-bold">{bus ? bus.busNo : 'Pool Standby'}</span>
                      </div>
                    </div>

                    {isLicenseExpired && (
                      <div className="p-2 bg-rose-50 text-rose-600 rounded-lg text-[9px] font-black flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> License requires immediate renewal!
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                    <button
                      onClick={() => handleDriverCheckIn(d.id)}
                      className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[9px] font-black cursor-pointer"
                    >
                      Check-In Today
                    </button>
                    <button
                      onClick={() => {
                        setDrivers(drivers.filter(drv => drv.id !== d.id));
                        showToast("Driver Record Removed", `Driver ${d.name} deleted from records.`);
                      }}
                      className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer animate-none"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: Attendance & Boarding Ledger */}
      {activeTab === 'attendance' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Driver Attendance list */}
          <div className="lg:col-span-4 border border-slate-200 rounded-2xl p-5 bg-slate-50/30 space-y-4">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <span>⏰</span> On Duty Driver Check-Ins
            </h3>
            
            <div className="space-y-2.5 max-h-[400px] overflow-y-auto">
              {driverAttendance.map(da => (
                <div key={da.id} className="border border-slate-150 rounded-xl p-3 bg-white space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-slate-850">{da.driverName}</span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                      da.status === 'Present' ? 'bg-emerald-50 text-emerald-600 border border-emerald-150' : 'bg-amber-50 text-amber-600 border border-amber-150'
                    }`}>
                      {da.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-xxs text-slate-400 font-bold">
                    <span>In: {da.checkIn} {da.checkOut ? `| Out: ${da.checkOut}` : ''}</span>
                    <span>{da.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Student RFID Boarding Logger & History */}
          <div className="lg:col-span-8 border border-slate-200 rounded-2xl p-5 space-y-5 bg-white">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Student Boarding & Deboarding RFID simulator</h3>
                <p className="text-xxs text-slate-400 mt-0.5 font-semibold">Simulate a student tapping their bus card during pick-up/drop-off stops.</p>
              </div>
              <span className="text-xxs font-black text-indigo-600 bg-indigo-50 border border-indigo-150 px-3 py-1.5 rounded-lg">
                📋 Today's Boarding Activity List
              </span>
            </div>

            {/* Manual Swipe / Scan Simulator Panel */}
            <form onSubmit={handleBoardingSubmit} className="grid grid-cols-1 sm:grid-cols-5 gap-3 border border-slate-150 p-4 rounded-2xl bg-slate-50/50">
              <div className="sm:col-span-2">
                <label className="block text-[9px] font-black text-slate-500 uppercase mb-1">Select Student</label>
                <select
                  required
                  value={boardingForm.studentId}
                  onChange={(e) => setBoardingForm({ ...boardingForm, studentId: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-indigo-500"
                >
                  <option value="">Select student...</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.rollNumber || 'No Roll'})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase mb-1">Route No</label>
                <select
                  value={boardingForm.routeId}
                  onChange={(e) => setBoardingForm({ ...boardingForm, routeId: e.target.value, stopId: routes.find(r => r.id === e.target.value)?.stops[0]?.id || '' })}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-indigo-500"
                >
                  {routes.map(r => (
                    <option key={r.id} value={r.id}>{r.name.split(' ')[0]}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase mb-1">Stop Terminal</label>
                <select
                  value={boardingForm.stopId}
                  onChange={(e) => setBoardingForm({ ...boardingForm, stopId: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-indigo-500"
                >
                  {boardingStops.map(st => (
                    <option key={st.id} value={st.id}>{st.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase mb-1">Swipe Event</label>
                <select
                  value={boardingForm.type}
                  onChange={(e) => setBoardingForm({ ...boardingForm, type: e.target.value as any })}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-semibold focus:outline-indigo-500"
                >
                  <option value="Boarding">Boarding 🟢</option>
                  <option value="Deboarding">Deboarding 🔴</option>
                </select>
              </div>

              <div className="sm:col-span-5 flex justify-end mt-1">
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black cursor-pointer transition-all flex items-center gap-1"
                >
                  <Wifi className="h-3 w-3" /> Simulate Card RFID Swipe
                </button>
              </div>
            </form>

            {/* Activity list logs */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {studentBoardingLogs.map(log => (
                <div key={log.id} className="border border-slate-100 rounded-xl p-3 bg-white flex justify-between items-center hover:bg-slate-50/40 transition-all">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${log.type === 'Boarding' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <div>
                      <span className="text-xs font-black text-slate-800">{log.studentName}</span>
                      <span className="text-[10px] text-slate-400 font-bold block">
                        {log.type} at Stop: <strong className="text-slate-600 font-black">{log.stopName}</strong> ({log.routeName})
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xxs font-mono font-bold text-slate-400 block">{log.timestamp}</span>
                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${
                      log.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {log.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
