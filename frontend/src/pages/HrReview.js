import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { onboardingService } from '../services/onboardingService';
import toast from 'react-hot-toast';

const HrReview = () => {
    const queryClient = useQueryClient();
    const { data, isLoading } = useQuery(['onboardingSubmissions'], onboardingService.listSubmissions);
    const [officialEmail, setOfficialEmail] = useState('');
    const [employeePayload, setEmployeePayload] = useState({ employeeId: '', department: '', position: '', salary: 0, firstName: '', lastName: '', phone: '', dateOfBirth: '', gender: 'male', hireDate: '' });

    const approveMutation = useMutation(({ userId, officialEmail, employee }) => onboardingService.approve(userId, officialEmail, employee), {
        onSuccess: () => {
            toast.success('Onboarding approved');
            queryClient.invalidateQueries('onboardingSubmissions');
            setOfficialEmail('');
            setEmployeePayload({ employeeId: '', department: '', position: '', salary: 0, firstName: '', lastName: '', phone: '', dateOfBirth: '', gender: 'male', hireDate: '' });
        },
        onError: (e) => toast.error(e?.response?.data?.message || 'Approval failed'),
    });

    const handleApprove = (userId, data) => {
        const employee = {
            ...employeePayload,
            firstName: data?.data?.firstName || employeePayload.firstName,
            lastName: data?.data?.lastName || employeePayload.lastName,
            phone: data?.data?.phone || employeePayload.phone,
            dateOfBirth: data?.data?.dateOfBirth || employeePayload.dateOfBirth,
            gender: data?.data?.gender || employeePayload.gender,
        };
        approveMutation.mutate({ userId, officialEmail, employee });
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-semibold text-gray-800">Onboarding Submissions</h2>
            <div className="card">
                {isLoading ? (
                    <div>Loading...</div>
                ) : (
                    <div className="space-y-6">
                        {(data?.submissions || []).map((s) => (
                            <div key={s._id} className="border rounded-md p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-700">User: {s.userId?.username} | Personal Email: {s.userId?.email}</div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <input className="input" placeholder="Official Email" value={officialEmail} onChange={(e) => setOfficialEmail(e.target.value)} />
                                    <input className="input" placeholder="Employee ID" value={employeePayload.employeeId} onChange={(e) => setEmployeePayload({ ...employeePayload, employeeId: e.target.value })} />
                                    <input className="input" placeholder="Department" value={employeePayload.department} onChange={(e) => setEmployeePayload({ ...employeePayload, department: e.target.value })} />
                                    <input className="input" placeholder="Position" value={employeePayload.position} onChange={(e) => setEmployeePayload({ ...employeePayload, position: e.target.value })} />
                                    <input className="input" type="number" placeholder="Salary" value={employeePayload.salary} onChange={(e) => setEmployeePayload({ ...employeePayload, salary: Number(e.target.value) })} />
                                    <input className="input" type="date" placeholder="Hire Date" value={employeePayload.hireDate} onChange={(e) => setEmployeePayload({ ...employeePayload, hireDate: e.target.value })} />
                                </div>
                                <div className="text-right">
                                    <button className="btn-primary" onClick={() => handleApprove(s.userId._id, s)}>Approve & Create Employee</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HrReview;


