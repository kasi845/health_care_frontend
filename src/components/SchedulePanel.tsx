import { useState, useEffect } from "react";
import { Calendar, Clock, MessageSquare, ChevronDown, Trash2, ToggleLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  createSchedule,
  listSchedules,
  updateSchedule,
  deleteSchedule,
  type ScheduleItem,
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function SchedulePanel() {
  const [open, setOpen] = useState(false);
  const [time, setTime] = useState("");
  const [message, setMessage] = useState("");
  const [daily, setDaily] = useState(false);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const { toast } = useToast();

  const loadSchedules = async () => {
    setListLoading(true);
    try {
      const list = await listSchedules();
      setSchedules(list);
    } catch {
      setSchedules([]);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    if (open) loadSchedules();
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = time.trim();
    const m = message.trim();
    if (!t) {
      toast({ title: "Enter time", variant: "destructive" });
      return;
    }
    if (!m) {
      toast({ title: "Enter a message", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await createSchedule(m, t, daily);
      setTime("");
      setMessage("");
      toast({ title: "Scheduled", description: "Alert will be sent to your email at the set time." });
      loadSchedules();
    } catch (e: Error) {
      toast({
        title: "Could not create schedule",
        description: e?.message || "Check backend and SMTP settings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSchedule(id);
      loadSchedules();
      toast({ title: "Schedule removed" });
    } catch (e: Error) {
      toast({ title: "Could not delete", description: e?.message, variant: "destructive" });
    }
  };

  const handleToggleDaily = async (item: ScheduleItem) => {
    try {
      await updateSchedule(item.id, { daily: !item.daily });
      loadSchedules();
    } catch (e: Error) {
      toast({ title: "Could not update", description: e?.message, variant: "destructive" });
    }
  };

  const pending = schedules.filter((s) => s.status === "pending");
  const finished = schedules.filter((s) => s.status === "finished");

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="relative flex items-center gap-3">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-primary/30 bg-primary/5 backdrop-blur-sm transition-all duration-300 hover:border-primary/60 hover:bg-primary/10"
            style={{ boxShadow: "0 0 12px hsl(190 100% 50% / 0.12)" }}
          >
            <Calendar className="w-4 h-4 text-primary" />
            <span
              className="font-display text-[0.65rem] tracking-[0.18em] text-primary hidden md:inline"
              style={{ textShadow: "0 0 6px hsl(var(--primary) / 0.4)" }}
            >
              SCHEDULE
            </span>
            <ChevronDown
              className={`w-4 h-4 text-primary transition-transform ${open ? "rotate-180" : ""}`}
            />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent className="absolute left-4 right-4 md:left-auto md:right-0 top-full mt-2 z-50 w-full md:w-auto md:min-w-[380px]">
          <div className="glass-panel border border-primary/20 rounded-xl p-4 shadow-xl space-y-4">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex items-center gap-2 text-primary font-display text-xs tracking-wider">
                <Clock className="w-4 h-4" />
                <label className="flex-1">Time</label>
              </div>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                disabled={loading}
                className="h-10 bg-muted/30 border-primary/20 rounded-lg"
              />
              <div className="flex items-center gap-2 text-primary font-display text-xs tracking-wider">
                <MessageSquare className="w-4 h-4" />
                <label className="flex-1">Custom message</label>
              </div>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="e.g. Take medicine, Chest pain check..."
                disabled={loading}
                className="min-h-[80px] bg-muted/30 border-primary/20 rounded-lg text-sm resize-y"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ToggleLeft className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Daily</span>
                  <Switch checked={daily} onCheckedChange={setDaily} />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-9 px-4 rounded-lg font-display text-xs tracking-wider bg-primary/20 border border-primary/40 text-primary hover:bg-primary/30"
                >
                  {loading ? "Adding…" : "Schedule"}
                </Button>
              </div>
            </form>

            <div className="border-t border-primary/10 pt-3">
              <p className="font-display text-xs text-primary/80 tracking-wider mb-2">
                Schedule list
              </p>
              {listLoading ? (
                <p className="text-xs text-muted-foreground">Loading…</p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {pending.length > 0 && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                        Pending
                      </p>
                      <ul className="space-y-1">
                        {pending.map((s) => (
                          <li
                            key={s.id}
                            className="flex items-center justify-between gap-2 py-2 px-2 rounded-lg bg-muted/20 border border-primary/10"
                          >
                            <div className="min-w-0 flex-1">
                              <span className="text-xs font-medium truncate block">{s.message}</span>
                              <span className="text-[10px] text-muted-foreground">
                                {s.time}
                                {s.daily ? " · Daily" : ""}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleToggleDaily(s)}
                                className="p-1 rounded text-muted-foreground hover:text-primary"
                                title={s.daily ? "Turn off daily" : "Turn on daily"}
                              >
                                <ToggleLeft className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(s.id)}
                                className="p-1 rounded text-muted-foreground hover:text-destructive"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {finished.length > 0 && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                        Finished
                      </p>
                      <ul className="space-y-1">
                        {finished.map((s) => (
                          <li
                            key={s.id}
                            className="flex items-center justify-between gap-2 py-2 px-2 rounded-lg bg-muted/10 border border-primary/5"
                          >
                            <div className="min-w-0 flex-1">
                              <span className="text-xs text-muted-foreground truncate block">
                                {s.message}
                              </span>
                              <span className="text-[10px] text-muted-foreground/80">{s.time}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDelete(s.id)}
                              className="p-1 rounded text-muted-foreground hover:text-destructive"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {pending.length === 0 && finished.length === 0 && (
                    <p className="text-xs text-muted-foreground py-2">
                      No schedules. Add one above; it will be sent to your login email at the set
                      time.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
