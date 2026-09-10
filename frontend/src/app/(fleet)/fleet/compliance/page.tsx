'use client';

export default function CompliancePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary">Compliance & Maintenance</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="font-semibold mb-4">License Expiry</h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 border rounded"><span>Driver License #DL-001</span><span className="text-warning">Expires in 15 days</span></div>
            <div className="flex justify-between items-center p-2 border rounded"><span>Driver License #DL-002</span><span className="text-success">Valid</span></div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="font-semibold mb-4">Maintenance Due</h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 border rounded"><span>Vehicle REG-001</span><span className="text-critical">Due now</span></div>
            <div className="flex justify-between items-center p-2 border rounded"><span>Vehicle REG-002</span><span className="text-warning">Due in 30 days</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
