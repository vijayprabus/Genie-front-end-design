import React, { useState } from "react";

const f = "Inter, sans-serif";

const ws = {
  page: "#FAF8F5", surface: "#FFFDF9", sidebar: "#F5F0EB", muted: "#F0EBE4",
  elevated: "#F5F0EB", border: "#E7E0D8", divider: "#F0EBE4", inputBorder: "#D6D3D1",
  heading: "#292524", body: "#44403C", secondary: "#78716C", muted_text: "#A8A29E",
  disabled: "#D6D3D1", primary: "#7C3AED", primaryHover: "#6D28D9", primaryLight: "#EDE9FE",
  primaryDark: "#5B21B6", success: "#10B981", successFg: "#065F46", successBg: "#ECFDF5",
  warning: "#F59E0B", warningFg: "#92400E", warningBg: "#FFFBEB", error: "#E11D48",
  errorFg: "#9F1239", errorBg: "#FFF1F2", hoverBg: "#EDE8E3",
};

interface Service {
  name: string;
  role: string;
  status: "Connected" | "Degraded";
}

interface Document {
  name: string;
  subtitle: string;
  required: string;
  threshold: string;
  source: string;
  sourceStatus: "Connected" | "Degraded";
}

const services: Service[] = [
  { name: "NSDL", role: "PAN verification", status: "Connected" },
  { name: "GSTN", role: "GST verification", status: "Connected" },
  { name: "UIDAI", role: "Aadhaar eKYC", status: "Degraded" },
  { name: "NPCI", role: "Bank penny drop", status: "Connected" },
  { name: "MCA21", role: "CIN verification", status: "Connected" },
  { name: "SAP", role: "Customer master / ERP", status: "Connected" },
  { name: "Email", role: "HITL + notifications", status: "Connected" },
];

const documents: Document[] = [
  { name: "PAN Card", subtitle: "Permanent Account Number", required: "Required", threshold: "95", source: "NSDL", sourceStatus: "Connected" },
  { name: "GST Certificate", subtitle: "GSTIN Registration", required: "Required", threshold: "95", source: "GSTN", sourceStatus: "Connected" },
  { name: "Bank Account", subtitle: "Penny drop verification", required: "Required", threshold: "90", source: "NPCI", sourceStatus: "Connected" },
  { name: "Aadhaar", subtitle: "UID via DigiLocker", required: "Optional", threshold: "95", source: "UIDAI", sourceStatus: "Degraded" },
  { name: "CIN", subtitle: "Company Identification", required: "Optional", threshold: "90", source: "MCA21", sourceStatus: "Connected" },
];

const sectionLabel: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: 0.3,
  color: ws.muted_text,
  marginBottom: 10,
  fontFamily: f,
};

const selectStyle: React.CSSProperties = {
  padding: "5px 10px",
  borderRadius: 6,
  border: `1px solid ${ws.border}`,
  fontSize: 12,
  fontFamily: f,
  color: ws.body,
  backgroundColor: ws.surface,
  outline: "none",
  cursor: "pointer",
};

const inputStyle: React.CSSProperties = {
  width: 50,
  textAlign: "center",
  padding: "4px 6px",
  border: `1px solid ${ws.border}`,
  borderRadius: 6,
  fontSize: 11,
  fontFamily: f,
  color: ws.body,
  backgroundColor: ws.surface,
  outline: "none",
};

export default function ConfigurationTab() {
  const [docRequired, setDocRequired] = useState<string[]>(
    documents.map((d) => d.required)
  );
  const [docThresholds, setDocThresholds] = useState<string[]>(
    documents.map((d) => d.threshold)
  );
  const [activeCountry, setActiveCountry] = useState<string>("India");
  const [defaultReviewer, setDefaultReviewer] = useState("Priya Anand");
  const [escalationTimer, setEscalationTimer] = useState("4 hours");
  const [backupReviewer, setBackupReviewer] = useState("Arjun Mehta");
  const [codeScheme, setCodeScheme] = useState("Regional prefix");
  const [erpFailure, setErpFailure] = useState("Retry 3x then flag");
  const [emailActive, setEmailActive] = useState(true);
  const [smsActive, setSmsActive] = useState(false);

  const updateRequired = (index: number, value: string) => {
    setDocRequired((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const updateThreshold = (index: number, value: string) => {
    setDocThresholds((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const countries = ["India", "Saudi Arabia"];

  return (
    <div style={{ fontFamily: f, display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Section 1: Connected Services */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ ...sectionLabel, marginBottom: 0 }}>CONNECTED SERVICES</div>
          <div
            style={{ fontSize: 12, fontWeight: 400, color: ws.primary, cursor: "pointer", fontFamily: f }}
          >
            Manage in Integrations &rarr;
          </div>
        </div>
        <div style={{ border: `1px solid ${ws.border}`, borderRadius: 10, backgroundColor: ws.surface, overflow: "hidden" }}>
          {services.map((svc, i) => (
            <div
              key={svc.name}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "10px 14px",
                borderBottom: i < services.length - 1 ? `1px solid ${ws.muted}` : "none",
              }}
            >
              {svc.status === "Connected" ? (
                <div
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    backgroundColor: ws.success,
                    flexShrink: 0,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    border: `1.5px solid ${ws.warning}`,
                    backgroundColor: "transparent",
                    flexShrink: 0,
                    boxSizing: "border-box",
                  }}
                />
              )}
              <div
                style={{
                  width: 60,
                  fontSize: 13,
                  fontWeight: 600,
                  color: ws.body,
                  marginLeft: 12,
                  fontFamily: f,
                }}
              >
                {svc.name}
              </div>
              <div style={{ flex: 1, fontSize: 12, fontWeight: 400, color: ws.muted_text, fontFamily: f }}>
                {svc.role}
              </div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: svc.status === "Degraded" ? 500 : 400,
                  color: svc.status === "Degraded" ? ws.warningFg : ws.muted_text,
                  fontFamily: f,
                }}
              >
                {svc.status}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Document Requirements */}
      <div>
        <div style={sectionLabel}>DOCUMENT REQUIREMENTS</div>
        <div style={{ display: "flex", borderBottom: `1px solid ${ws.border}`, marginBottom: 0 }}>
          {countries.map((country) => (
            <div
              key={country}
              onClick={() => setActiveCountry(country)}
              style={{
                padding: "8px 14px",
                fontSize: 13,
                fontWeight: activeCountry === country ? 500 : 400,
                color: activeCountry === country ? ws.body : ws.muted_text,
                borderBottom: activeCountry === country ? `2px solid ${ws.body}` : "2px solid transparent",
                cursor: "pointer",
                fontFamily: f,
              }}
            >
              {country}
            </div>
          ))}
          <div
            style={{
              padding: "8px 14px",
              fontSize: 13,
              fontWeight: 400,
              color: ws.disabled,
              cursor: "pointer",
              fontFamily: f,
            }}
          >
            + Add country
          </div>
        </div>
        <div style={{ border: `1px solid ${ws.border}`, borderRadius: 10, backgroundColor: ws.surface, overflow: "hidden" }}>
          {/* Table header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "8px 14px",
              backgroundColor: ws.elevated,
              borderBottom: `1px solid ${ws.muted}`,
            }}
          >
            <div style={{ flex: 1, fontSize: 10, fontWeight: 500, textTransform: "uppercase", color: ws.muted_text, fontFamily: f }}>
              DOCUMENT
            </div>
            <div style={{ width: 130, fontSize: 10, fontWeight: 500, textTransform: "uppercase", color: ws.muted_text, fontFamily: f }}>
              REQUIRED
            </div>
            <div style={{ width: 90, fontSize: 10, fontWeight: 500, textTransform: "uppercase", color: ws.muted_text, fontFamily: f }}>
              THRESHOLD
            </div>
            <div style={{ width: 150, fontSize: 10, fontWeight: 500, textTransform: "uppercase", color: ws.muted_text, fontFamily: f }}>
              SOURCE
            </div>
          </div>
          {/* Table rows */}
          {documents.map((doc, i) => (
            <div
              key={doc.name}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "10px 14px",
                borderBottom: i < documents.length - 1 ? `1px solid ${ws.muted}` : "none",
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: ws.body, fontFamily: f }}>
                  {doc.name}
                </div>
                <div style={{ fontSize: 11, fontWeight: 400, color: ws.disabled, fontFamily: f, marginTop: 2 }}>
                  {doc.subtitle}
                </div>
              </div>
              <div style={{ width: 130 }}>
                <select
                  value={docRequired[i]}
                  onChange={(e) => updateRequired(i, e.target.value)}
                  style={{ ...selectStyle, padding: "4px 10px", fontSize: 11 }}
                >
                  <option value="Required">Required</option>
                  <option value="Optional">Optional</option>
                </select>
              </div>
              <div style={{ width: 90 }}>
                <input
                  type="text"
                  value={`${docThresholds[i]}%`}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, "");
                    updateThreshold(i, raw);
                  }}
                  style={inputStyle}
                />
              </div>
              <div style={{ width: 150, fontSize: 11, fontFamily: f, color: ws.muted_text }}>
                {doc.source} &middot;{" "}
                {doc.sourceStatus === "Degraded" ? (
                  <span style={{ color: ws.warningFg, fontWeight: 500 }}>Degraded</span>
                ) : (
                  "Connected"
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Review & Escalation */}
      <div>
        <div style={sectionLabel}>REVIEW &amp; ESCALATION</div>
        <div>
          {/* Row 1 */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 0",
              borderBottom: `1px solid ${ws.muted}`,
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: ws.body, fontFamily: f }}>
                Default reviewer
              </div>
              <div style={{ fontSize: 11, fontWeight: 400, color: ws.disabled, fontFamily: f, marginTop: 2 }}>
                Receives all flagged cases via email
              </div>
            </div>
            <select
              value={defaultReviewer}
              onChange={(e) => setDefaultReviewer(e.target.value)}
              style={selectStyle}
            >
              <option value="Priya Anand">Priya Anand</option>
              <option value="Arjun Mehta">Arjun Mehta</option>
              <option value="Vikram Shah">Vikram Shah</option>
            </select>
          </div>
          {/* Row 2 */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 0",
              borderBottom: `1px solid ${ws.muted}`,
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: ws.body, fontFamily: f }}>
                Escalation timer
              </div>
              <div style={{ fontSize: 11, fontWeight: 400, color: ws.disabled, fontFamily: f, marginTop: 2 }}>
                Reassign to backup if no response
              </div>
            </div>
            <select
              value={escalationTimer}
              onChange={(e) => setEscalationTimer(e.target.value)}
              style={selectStyle}
            >
              <option value="1 hour">1 hour</option>
              <option value="2 hours">2 hours</option>
              <option value="4 hours">4 hours</option>
              <option value="8 hours">8 hours</option>
              <option value="24 hours">24 hours</option>
            </select>
          </div>
          {/* Row 3 */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 0",
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: ws.body, fontFamily: f }}>
                Backup reviewer
              </div>
            </div>
            <select
              value={backupReviewer}
              onChange={(e) => setBackupReviewer(e.target.value)}
              style={selectStyle}
            >
              <option value="Arjun Mehta">Arjun Mehta</option>
              <option value="Priya Anand">Priya Anand</option>
              <option value="Vikram Shah">Vikram Shah</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section 4: Output */}
      <div>
        <div style={sectionLabel}>OUTPUT</div>
        <div>
          {/* Row 1 */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 0",
              borderBottom: `1px solid ${ws.muted}`,
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: ws.body, fontFamily: f }}>
                Customer code scheme
              </div>
              <div style={{ fontSize: 11, fontWeight: 400, color: ws.disabled, fontFamily: f, marginTop: 2 }}>
                How codes are generated in SAP
              </div>
            </div>
            <select
              value={codeScheme}
              onChange={(e) => setCodeScheme(e.target.value)}
              style={selectStyle}
            >
              <option value="Regional prefix">Regional prefix</option>
              <option value="Sequential">Sequential</option>
              <option value="UUID">UUID</option>
            </select>
          </div>
          {/* Row 2 */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 0",
              borderBottom: `1px solid ${ws.muted}`,
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: ws.body, fontFamily: f }}>
                On ERP failure
              </div>
              <div style={{ fontSize: 11, fontWeight: 400, color: ws.disabled, fontFamily: f, marginTop: 2 }}>
                If SAP rejects the customer record
              </div>
            </div>
            <select
              value={erpFailure}
              onChange={(e) => setErpFailure(e.target.value)}
              style={selectStyle}
            >
              <option value="Retry 3x then flag">Retry 3x then flag</option>
              <option value="Flag immediately">Flag immediately</option>
              <option value="Retry indefinitely">Retry indefinitely</option>
            </select>
          </div>
          {/* Row 3 */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 0",
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: ws.body, fontFamily: f }}>
                Notify applicant via
              </div>
              <div style={{ fontSize: 11, fontWeight: 400, color: ws.disabled, fontFamily: f, marginTop: 2 }}>
                Channels for approval, rejection, resubmission
              </div>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              <button
                onClick={() => setEmailActive((prev) => !prev)}
                style={{
                  padding: "4px 10px",
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 500,
                  fontFamily: f,
                  cursor: "pointer",
                  border: emailActive ? "none" : `1px solid ${ws.border}`,
                  backgroundColor: emailActive ? ws.primary : ws.surface,
                  color: emailActive ? "#FFF" : ws.secondary,
                  outline: "none",
                }}
              >
                Email
              </button>
              <button
                onClick={() => setSmsActive((prev) => !prev)}
                style={{
                  padding: "4px 10px",
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 500,
                  fontFamily: f,
                  cursor: "pointer",
                  border: smsActive ? "none" : `1px solid ${ws.border}`,
                  backgroundColor: smsActive ? ws.primary : ws.surface,
                  color: smsActive ? "#FFF" : ws.secondary,
                  outline: "none",
                }}
              >
                SMS
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
