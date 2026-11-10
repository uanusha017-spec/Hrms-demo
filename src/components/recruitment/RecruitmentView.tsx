import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { apiFetch } from '../../lib/api.ts';
import { JobOpening, Candidate, Department } from '../../types/index.ts';
import {
  UserPlus,
  Briefcase,
  Star,
  Plus,
  ChevronRight,
  Mail,
  Phone,
  Clock,
  X,
  Building
} from 'lucide-react';

export const RecruitmentView: React.FC = () => {
  const { currentTenant } = useAuth();
  const [jobs, setJobs] = useState<JobOpening[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddJobOpen, setIsAddJobOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  const [jobForm, setJobForm] = useState({
    title: '',
    departmentId: '',
    openings: '1',
    experienceLevel: '4+ Years',
    employmentType: 'Full-time',
    salaryRange: '₹12,00,000 - ₹18,00,000 / yr',
    description: ''
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [recRes, orgRes] = await Promise.all([
        apiFetch('/recruitment/overview'),
        apiFetch('/organization/all')
      ]);
      setJobs(recRes.jobs || []);
      setCandidates(recRes.candidates || []);
      setDepartments(orgRes.departments || []);
      if (orgRes.departments?.length > 0 && !jobForm.departmentId) {
        setJobForm(prev => ({ ...prev, departmentId: orgRes.departments[0].id }));
      }
    } catch (err) {
      console.error('Failed to load recruitment data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentTenant?.id]);

  const handleStageChange = async (candidateId: string, newStage: string) => {
    try {
      await apiFetch(`/recruitment/candidates/${candidateId}/stage`, {
        method: 'PATCH',
        body: JSON.stringify({ stage: newStage })
      });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Stage update failed');
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/recruitment/jobs', {
        method: 'POST',
        body: JSON.stringify(jobForm)
      });
      setIsAddJobOpen(false);
      setJobForm({
        title: '',
        departmentId: departments[0]?.id || '',
        openings: '1',
        experienceLevel: '4+ Years',
        employmentType: 'Full-time',
        salaryRange: '₹12,00,000 - ₹18,00,000 / yr',
        description: ''
      });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create job');
    }
  };

  const stages = [
    { id: 'APPLIED', label: 'Applied' },
    { id: 'SCREENING', label: 'Screening' },
    { id: 'SHORTLISTED', label: 'Shortlisted' },
    { id: 'INTERVIEW', label: 'Interview' },
    { id: 'OFFER_SENT', label: 'Offer Sent' },
    { id: 'HIRED', label: 'Hired' }
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Recruitment & ATS Pipeline</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage job requisitions, candidate evaluation scorecards, and multi-stage interview workflows.
          </p>
        </div>

        <button
          onClick={() => setIsAddJobOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Job Opening</span>
        </button>
      </div>

      {/* Active Jobs Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {jobs.map(j => (
          <div key={j.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-bold text-white text-sm">{j.title}</span>
                <div className="text-xs text-slate-400 mt-0.5">{j.departmentName} • {j.experienceLevel}</div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {j.openings} Openings
              </span>
            </div>
            <p className="text-xs text-slate-300 line-clamp-2">{j.description}</p>
            <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-800">
              <span className="font-mono text-emerald-400 font-semibold">{j.salaryRange}</span>
              <span>{candidates.filter(c => c.jobId === j.id).length} Active Applicants</span>
            </div>
          </div>
        ))}
      </div>

      {/* Kanban Pipeline Board */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-white">Talent Acquisition Stage Board</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {stages.map(st => {
            const stageCandidates = candidates.filter(c => c.stage === st.id);
            return (
              <div key={st.id} className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col min-h-[300px]">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs">
                  <span className="font-bold text-slate-300">{st.label}</span>
                  <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] font-bold text-slate-400">
                    {stageCandidates.length}
                  </span>
                </div>

                <div className="space-y-2 flex-1">
                  {stageCandidates.map(c => (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCandidate(c)}
                      className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg space-y-1.5 cursor-pointer hover:border-slate-700 transition"
                    >
                      <div className="font-bold text-white text-xs">{c.name}</div>
                      <div className="text-[10px] text-blue-400 font-medium truncate">{c.jobTitle}</div>
                      <div className="flex items-center gap-1 text-[10px] text-amber-400">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{c.rating}/5 Rating</span>
                      </div>
                      <div className="text-[10px] text-slate-400">{c.experienceYears} yrs • {c.currentCompany}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Candidate Profile & Stage Move Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-white">{selectedCandidate.name}</h2>
                <div className="text-xs text-blue-400">{selectedCandidate.jobTitle}</div>
              </div>
              <button onClick={() => setSelectedCandidate(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1 text-slate-300">
                <div>Email: <span className="text-white">{selectedCandidate.email}</span></div>
                <div>Phone: <span className="text-white">{selectedCandidate.phone}</span></div>
                <div>Experience: <span className="text-white">{selectedCandidate.experienceYears} Years</span></div>
                <div>Current Company: <span className="text-white">{selectedCandidate.currentCompany}</span></div>
              </div>

              {selectedCandidate.notes && (
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-slate-300">
                  <div className="font-semibold text-blue-400 mb-1">Interview Assessment Notes:</div>
                  <p>{selectedCandidate.notes}</p>
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Advance Pipeline Stage</label>
                <select
                  value={selectedCandidate.stage}
                  onChange={e => {
                    handleStageChange(selectedCandidate.id, e.target.value);
                    setSelectedCandidate(null);
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-bold"
                >
                  {stages.map(s => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Job Modal */}
      {isAddJobOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white">Create New Job Opening</h2>
              <button onClick={() => setIsAddJobOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Position Title *</label>
                <input
                  required
                  type="text"
                  value={jobForm.title}
                  onChange={e => setJobForm({ ...jobForm, title: e.target.value })}
                  placeholder="e.g. Staff Backend Engineer"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Department</label>
                  <select
                    value={jobForm.departmentId}
                    onChange={e => setJobForm({ ...jobForm, departmentId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Number of Openings</label>
                  <input
                    type="number"
                    min="1"
                    value={jobForm.openings}
                    onChange={e => setJobForm({ ...jobForm, openings: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Experience Required</label>
                  <input
                    type="text"
                    value={jobForm.experienceLevel}
                    onChange={e => setJobForm({ ...jobForm, experienceLevel: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Salary Range</label>
                  <input
                    type="text"
                    value={jobForm.salaryRange}
                    onChange={e => setJobForm({ ...jobForm, salaryRange: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Job Description</label>
                <textarea
                  rows={3}
                  value={jobForm.description}
                  onChange={e => setJobForm({ ...jobForm, description: e.target.value })}
                  placeholder="Responsibilities and skill requirements..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddJobOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold"
                >
                  Publish Job Posting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
