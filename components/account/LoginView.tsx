"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";
import { LocLink } from "@/components/ui/LocLink";
import { PageHeader } from "@/components/ui/SectionHead";

type Mode = "login" | "register" | "forgot";
type Errs = Partial<Record<"name" | "email" | "password", string>>;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function TextField({ label, hint, error, children }: {
  label: string; hint?: string; error?: string;
  children: (a: { id: string; "aria-invalid": boolean; "aria-describedby"?: string }) => ReactNode;
}) {
  const id = useId();
  const eid = `${id}-e`;
  return (
    <div>
      <label className="label" htmlFor={id}>{label}</label>
      {children({ id, "aria-invalid": !!error, "aria-describedby": error ? eid : undefined })}
      {hint && !error && <p className="annot mt-1.5">{hint}</p>}
      {error && <p id={eid} role="alert" className="err">{error}</p>}
    </div>
  );
}

export function LoginView() {
  const { t } = useApp();
  const a = t.admin.login;
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errs, setErrs] = useState<Errs>({});
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "fail">("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const switchMode = (m: Mode) => { setMode(m); setErrs({}); setStatus("idle"); };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: Errs = {};
    if (mode === "register" && name.trim().length < 2) next.name = a.errors.name;
    if (!EMAIL_RE.test(email.trim())) next.email = a.errors.email;
    if (mode !== "forgot" && password.length < 8) next.password = a.errors.password;
    setErrs(next);
    if (Object.keys(next).length) { setStatus("fail"); return; }
    setStatus("sending");
    // Simulated: nothing is sent, nothing is stored.
    timer.current = setTimeout(() => setStatus("ok"), 700);
  };

  const busy = status === "sending";
  const tabBtn = (m: "login" | "register", label: string) => (
    <button type="button" role="tab" aria-selected={mode === m} tabIndex={mode === m ? 0 : -1} onClick={() => switchMode(m)}
      onKeyDown={(e) => { if (e.key.startsWith("Arrow")) { e.preventDefault(); switchMode(m === "login" ? "register" : "login"); } }}
      className={`min-h-11 flex-1 border-b-2 px-4 text-sm font-semibold transition-colors ${mode === m ? "border-forest text-ink" : "border-transparent text-mute hover:text-ink"}`}>
      {label}
    </button>
  );

  return (
    <>
      <PageHeader eyebrow={a.eyebrow} title={a.title} intro={a.intro} />
      <div className="wrap pb-20">
        <div className="mx-auto max-w-md">
          <p role="note" className="mb-6 flex gap-3 border border-copper bg-surface p-4 text-sm font-semibold">
            <Info size={18} className="mt-0.5 shrink-0 text-copper" aria-hidden />{a.banner}
          </p>

          {status === "ok" ? (
            <div role="status" className="grid gap-3 border border-forest bg-surface p-6">
              <CheckCircle2 className="text-forest" aria-hidden />
              <p className="display h-sm">{mode === "register" ? a.successRegister : a.successLogin}</p>
              <p className="text-sm text-soft">{a.successBody}</p>
              <LocLink to="/account" className="btn btn-primary justify-self-start">{a.goAccount}</LocLink>
            </div>
          ) : mode === "forgot" ? (
            <form onSubmit={submit} noValidate className="grid gap-5 border border-line bg-surface p-6">
              <h2 className="display h-sm">{a.forgotTitle}</h2>
              <p className="text-sm text-soft">{a.forgotBody}</p>
              <TextField label={a.email} error={errs.email}>
                {(p) => <input {...p} className="field" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />}
              </TextField>
              <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? a.submitting : a.forgotTitle}</button>
              <button type="button" className="btn btn-sm justify-self-start" onClick={() => switchMode("login")}>{a.forgotBack}</button>
            </form>
          ) : (
            <div className="border border-line bg-surface">
              <div role="tablist" aria-label={a.tablist} className="flex border-b border-line">
                {tabBtn("login", a.tabLogin)}
                {tabBtn("register", a.tabRegister)}
              </div>
              <form onSubmit={submit} noValidate className="grid gap-5 p-6" aria-busy={busy}>
                {status === "fail" && (
                  <div role="alert" className="flex gap-3 border border-[#b3321f] p-3 text-sm">
                    <AlertTriangle size={18} className="shrink-0 text-[#b3321f]" aria-hidden />{a.summary}
                  </div>
                )}
                {mode === "register" && (
                  <TextField label={a.name} error={errs.name}>
                    {(p) => <input {...p} className="field" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />}
                  </TextField>
                )}
                <TextField label={a.email} error={errs.email}>
                  {(p) => <input {...p} className="field" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />}
                </TextField>
                <TextField label={a.password} hint={a.passwordHint} error={errs.password}>
                  {(p) => <input {...p} className="field" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} />}
                </TextField>
                <button type="submit" className="btn btn-primary" disabled={busy}>
                  {busy ? a.submitting : mode === "login" ? a.submitLogin : a.submitRegister}
                </button>
                {mode === "login" && (
                  <button type="button" className="justify-self-start text-sm underline underline-offset-4 hover:text-copper" onClick={() => switchMode("forgot")}>{a.forgot}</button>
                )}
                <div className="rule pt-5">
                  <p className="annot mb-3">{a.socialTitle}</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {[a.google, a.apple].map((n) => (
                      <button key={n} type="button" className="btn" disabled aria-disabled="true">{n} · {a.notConnected}</button>
                    ))}
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
