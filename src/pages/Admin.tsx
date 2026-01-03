import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import RequireAdmin from "@/components/auth/RequireAdmin";
import { canDeleteWithTimestamps } from "@/utils/rateLimiter";

type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string | null;
};

type Recruiter = {
  user_id: string;
  company_name: string;
  industry: string | null;
  company_size: string | null;
};

type Partner = {
  id: string;
  company: string;
  contact_person: string;
  email: string;
  partnership_type: string;
  created_at: string;
};

const PAGE_SIZE = 6;

function usePaginator<T>(items: T[]) {
  const [page, setPage] = useState(1);
  const totalPages = useMemo(() => Math.max(1, Math.ceil(items.length / PAGE_SIZE)), [items.length]);
  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return items.slice(start, start + PAGE_SIZE);
  }, [items, page]);
  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);
  return { page, setPage, totalPages, paged };
}

function ExportButton({ data, filename }: { data: any[]; filename: string }) {
  const handleExport = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };
  return <Button variant="outline" onClick={handleExport}>Export JSON</Button>;
}

export default function Admin() {
  const [loading, setLoading] = useState(true);
  const [talents, setTalents] = useState<Profile[]>([]);
  const [recruiters, setRecruiters] = useState<Recruiter[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [search, setSearch] = useState("");
  const [selection, setSelection] = useState<Record<string, boolean>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [otpOpen, setOtpOpen] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [auditLogs, setAuditLogs] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem("admin_audit_logs") || "[]"); } catch { return []; }
  });
  const [deleteTimestamps, setDeleteTimestamps] = useState<number[]>([]);

  const filteredTalents = useMemo(() => talents.filter((t) => {
    const q = search.toLowerCase();
    return (t.email?.toLowerCase().includes(q) || (t.full_name || "").toLowerCase().includes(q));
  }), [talents, search]);

  const filteredRecruiters = useMemo(() => recruiters.filter((r) => {
    const q = search.toLowerCase();
    return (r.company_name?.toLowerCase().includes(q) || (r.industry || "").toLowerCase().includes(q));
  }), [recruiters, search]);

  const filteredPartners = useMemo(() => partners.filter((p) => {
    const q = search.toLowerCase();
    return (p.company.toLowerCase().includes(q) || p.email.toLowerCase().includes(q) || p.partnership_type.toLowerCase().includes(q));
  }), [partners, search]);

  const talentsPager = usePaginator(filteredTalents);
  const recruitersPager = usePaginator(filteredRecruiters);
  const partnersPager = usePaginator(filteredPartners);

  useEffect(() => {
    (async () => {
      try {
        const { data: profs } = await supabase.from("profiles").select("id, email, full_name, created_at");
        setTalents(profs || []);
        const { data: recs } = await supabase.from("recruiter_profiles").select("user_id, company_name, industry, company_size");
        setRecruiters(recs || []);
        const { data: parts } = await supabase.from("partner_applications").select("id, company, contact_person, email, partnership_type, created_at");
        setPartners(parts || []);
      } catch (err: any) {
        toast.error("Failed to load admin data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Simple client-side rate limiter for deletes: max 5 per minute
  const canDelete = useMemo(() => canDeleteWithTimestamps(deleteTimestamps), [deleteTimestamps]);

  const recordAudit = async (action: string, subject: string, subjectId: string, details?: any) => {
    let ip = "unknown";
    try {
      const res = await fetch("https://api.ipify.org?format=json");
      const j = await res.json();
      ip = j?.ip || ip;
    } catch {}
    const entry = { action, subject, subjectId, details, at: new Date().toISOString(), ip };
    setAuditLogs((prev) => {
      const next = [entry, ...prev];
      localStorage.setItem("admin_audit_logs", JSON.stringify(next));
      return next;
    });
  };

  const onBulkDelete = () => {
    const selected = Object.entries(selection).filter(([, v]) => v).map(([k]) => k);
    if (selected.length === 0) {
      toast.info("No accounts selected");
      return;
    }
    if (!canDelete) {
      toast.error("Delete rate limited. Try again later.");
      return;
    }
    if (selected.length >= 10) {
      toast.warning("Mass deletion attempt detected");
      recordAudit("mass_delete_attempt", "accounts", "bulk", { count: selected.length });
    }
    setConfirmOpen(true);
  };

  const exportSnapshot = (selectedIds: string[]) => {
    const snapshot = {
      at: new Date().toISOString(),
      selectedIds,
      talents: talents.filter((t) => selectedIds.includes(t.id)),
      recruiters: recruiters.filter((r) => selectedIds.includes(r.user_id)),
      partners: partners.filter((p) => selectedIds.includes(p.id)),
    };
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup-snapshot-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSoftDeleteConfirm = async () => {
    setConfirmOpen(false);
    // Soft delete: mark selection in local UI only (backend enforcement required for real deletes)
    const selected = Object.entries(selection).filter(([, v]) => v).map(([k]) => k);
    // Export backup snapshot before deletion
    exportSnapshot(selected);
    selected.forEach((id) => recordAudit("soft_delete", "account", id));
    setDeleteTimestamps((prev) => [...prev, Date.now()]);
    setOtpOpen(true);
  };

  const handlePermanentDelete = async () => {
    // Simulated 2FA verification: require 6-digit OTP before proceeding
    if (otpCode.trim().length !== 6) {
      toast.error("Enter the 6-digit verification code");
      return;
    }
    const selected = Object.entries(selection).filter(([, v]) => v).map(([k]) => k);
    selected.forEach((id) => recordAudit("permanent_delete", "account", id));
    setDeleteTimestamps((prev) => [...prev, Date.now()]);
    setOtpOpen(false);
    toast.success("Deletion completed (simulation)");
  };

  const toggleSelection = (id: string, checked: boolean) => {
    setSelection((prev) => ({ ...prev, [id]: checked }));
  };

  const renderPaginator = (page: number, totalPages: number, setPage: (n: number) => void, gridId: string) => (
    <Pagination aria-label="Admin pagination">
      <PaginationContent aria-controls={gridId}>
        <PaginationItem>
          <PaginationPrevious href="#" aria-label="Previous page" aria-disabled={page === 1} onClick={(e) => { e.preventDefault(); setPage(Math.max(1, page - 1)); }} />
        </PaginationItem>
        {(() => {
          const windowSize = 5;
          let start = Math.max(1, page - Math.floor(windowSize / 2));
          let end = start + windowSize - 1;
          if (end > totalPages) { end = totalPages; start = Math.max(1, end - windowSize + 1); }
          const items: JSX.Element[] = [];
          if (start > 1) {
            items.push(
              <PaginationItem key={1}><PaginationLink href="#" isActive={page === 1} aria-current={page === 1 ? "page" : undefined} onClick={(e) => { e.preventDefault(); setPage(1); }}>1</PaginationLink></PaginationItem>
            );
            if (start > 2) items.push(<PaginationItem key="s"><PaginationEllipsis /></PaginationItem>);
          }
          for (let n = start; n <= end; n++) {
            items.push(
              <PaginationItem key={n}><PaginationLink href="#" isActive={page === n} aria-current={page === n ? "page" : undefined} onClick={(e) => { e.preventDefault(); setPage(n); }}>{n}</PaginationLink></PaginationItem>
            );
          }
          if (end < totalPages) {
            if (end < totalPages - 1) items.push(<PaginationItem key="e"><PaginationEllipsis /></PaginationItem>);
            items.push(
              <PaginationItem key={totalPages}><PaginationLink href="#" isActive={page === totalPages} aria-current={page === totalPages ? "page" : undefined} onClick={(e) => { e.preventDefault(); setPage(totalPages); }}>{totalPages}</PaginationLink></PaginationItem>
            );
          }
          return items;
        })()}
        <PaginationItem>
          <PaginationNext href="#" aria-label="Next page" aria-disabled={page === totalPages} onClick={(e) => { e.preventDefault(); setPage(Math.min(totalPages, page + 1)); }} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-6"><CardContent>Loading admin data...</CardContent></Card>
      </div>
    );
  }

  return (
    <RequireAdmin>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="font-serif font-bold text-3xl">Admin Dashboard</h1>
            <div className="flex gap-2">
              <ExportButton data={auditLogs} filename="admin-audit-logs.json" />
              <Button variant="secondary" onClick={onBulkDelete}>Bulk Delete</Button>
            </div>
          </div>

          <Tabs defaultValue="users" className="space-y-6">
            <TabsList>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="audit">Audit Log</TabsTrigger>
              <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-8">
              <div className="flex items-center gap-3">
                <Input placeholder="Search users, companies, partners..." value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search" />
                <Badge>Delete rate: {canDelete ? "OK" : "Limited"}</Badge>
              </div>

              {/* Talents */}
              <section aria-label="Talents">
                <Card>
                  <CardHeader>
                    <CardTitle>Talents</CardTitle>
                    <CardDescription>All talent profiles</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div id="talents-grid" className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>
                              <Checkbox aria-label="Select all" onCheckedChange={(v) => {
                                const checked = Boolean(v);
                                const next: Record<string, boolean> = {};
                                talentsPager.paged.forEach((t) => next[t.id] = checked);
                                setSelection((prev) => ({ ...prev, ...next }));
                              }} />
                            </TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Created</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {talentsPager.paged.map((t) => (
                            <TableRow key={t.id}>
                              <TableCell><Checkbox checked={!!selection[t.id]} onCheckedChange={(v) => toggleSelection(t.id, Boolean(v))} /></TableCell>
                              <TableCell>{t.full_name || "—"}</TableCell>
                              <TableCell>{t.email}</TableCell>
                              <TableCell>{t.created_at ? new Date(t.created_at).toLocaleDateString() : "—"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">Showing {(talentsPager.page - 1) * PAGE_SIZE + 1}-{Math.min(talentsPager.page * PAGE_SIZE, filteredTalents.length)} of {filteredTalents.length}</p>
                      {renderPaginator(talentsPager.page, talentsPager.totalPages, talentsPager.setPage, "talents-grid")}
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Recruiters */}
              <section aria-label="Recruiters">
                <Card>
                  <CardHeader>
                    <CardTitle>Recruiters</CardTitle>
                    <CardDescription>Recruiter accounts with organization</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div id="recruiters-grid" className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead></TableHead>
                            <TableHead>Company</TableHead>
                            <TableHead>Industry</TableHead>
                            <TableHead>Size</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {recruitersPager.paged.map((r) => (
                            <TableRow key={r.user_id}>
                              <TableCell><Checkbox checked={!!selection[r.user_id]} onCheckedChange={(v) => toggleSelection(r.user_id, Boolean(v))} /></TableCell>
                              <TableCell>{r.company_name}</TableCell>
                              <TableCell>{r.industry || "—"}</TableCell>
                              <TableCell>{r.company_size || "—"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">Showing {(recruitersPager.page - 1) * PAGE_SIZE + 1}-{Math.min(recruitersPager.page * PAGE_SIZE, filteredRecruiters.length)} of {filteredRecruiters.length}</p>
                      {renderPaginator(recruitersPager.page, recruitersPager.totalPages, recruitersPager.setPage, "recruiters-grid")}
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Partners */}
              <section aria-label="Partners">
                <Card>
                  <CardHeader>
                    <CardTitle>Partners</CardTitle>
                    <CardDescription>Partner accounts (from applications)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div id="partners-grid" className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead></TableHead>
                            <TableHead>Company</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Type</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {partnersPager.paged.map((p) => (
                            <TableRow key={p.id}>
                              <TableCell><Checkbox checked={!!selection[p.id]} onCheckedChange={(v) => toggleSelection(p.id, Boolean(v))} /></TableCell>
                              <TableCell>{p.company}</TableCell>
                              <TableCell>{p.contact_person}</TableCell>
                              <TableCell>{p.email}</TableCell>
                              <TableCell><Badge variant="outline">{p.partnership_type}</Badge></TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">Showing {(partnersPager.page - 1) * PAGE_SIZE + 1}-{Math.min(partnersPager.page * PAGE_SIZE, filteredPartners.length)} of {filteredPartners.length}</p>
                      {renderPaginator(partnersPager.page, partnersPager.totalPages, partnersPager.setPage, "partners-grid")}
                    </div>
                  </CardContent>
                </Card>
              </section>
            </TabsContent>

            <TabsContent value="audit">
              <Card>
                <CardHeader>
                  <CardTitle>Audit Log</CardTitle>
                  <CardDescription>Recorded admin actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Time</TableHead>
                          <TableHead>IP</TableHead>
                          <TableHead>Action</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Details</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {auditLogs.map((l, i) => (
                          <TableRow key={i}>
                            <TableCell>{new Date(l.at).toLocaleString()}</TableCell>
                            <TableCell>{l.ip}</TableCell>
                            <TableCell>{l.action}</TableCell>
                            <TableCell>{l.subject} {l.subjectId}</TableCell>
                            <TableCell className="max-w-[320px] truncate">{JSON.stringify(l.details || {})}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="monitoring">
              <Card>
                <CardHeader>
                  <CardTitle>Monitoring</CardTitle>
                  <CardDescription>Deletion statistics and alerts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-3 gap-4">
                    <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Deletes last minute</p><p className="text-2xl font-bold">{deleteTimestamps.filter((t) => Date.now() - t < 60_000).length}</p></CardContent></Card>
                    <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Total soft deletes</p><p className="text-2xl font-bold">{auditLogs.filter((l) => l.action === "soft_delete").length}</p></CardContent></Card>
                    <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Permanent deletes</p><p className="text-2xl font-bold">{auditLogs.filter((l) => l.action === "permanent_delete").length}</p></CardContent></Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
        <Footer />
      </div>

      {/* Confirmation Modal */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm deletion</AlertDialogTitle>
            <AlertDialogDescription>
              This will perform a soft delete first. You can proceed to a permanent deletion after verification.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSoftDeleteConfirm}>Soft Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 2FA OTP Modal for permanent delete */}
      <Dialog open={otpOpen} onOpenChange={setOtpOpen}>
        <DialogContent aria-labelledby="otp-title">
          <DialogHeader>
            <DialogTitle id="otp-title" className="font-serif">Two-Factor Verification</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Enter the 6-digit code to confirm permanent deletion.</p>
          <div className="mt-3">
            <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode}>
              <InputOTPGroup>
                {[0,1,2,3,4,5].map((i) => (<InputOTPSlot key={i} index={i} />))}
              </InputOTPGroup>
            </InputOTP>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOtpOpen(false)}>Cancel</Button>
            <Button onClick={handlePermanentDelete}>Confirm Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </RequireAdmin>
  );
}