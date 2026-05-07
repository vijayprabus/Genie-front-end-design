import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useLayoutEffect,
} from "react";
import {
  Paperclip,
  ArrowUp,
  X,
  Mic,
  Database,
  Package,
  BarChart2,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  File,
} from "lucide-react";
import { ws, f } from "@/shared/utils/contentTokens";

// ─────────────────────────────────────────────────────────────
// SlashSquare icon — lucide-react doesn't ship this as a named
// export in all versions, so we inline a minimal SVG wrapper.
// ─────────────────────────────────────────────────────────────
function SlashSquareIcon({ size = 15, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <line x1="9" x2="15" y1="15" y2="9" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// Mock commands
// ─────────────────────────────────────────────────────────────
const COMMANDS = [
  { id: "text-to-sql",  icon: "Database",   label: "Text to SQL",          desc: "Query databases with natural language", category: "tools" as const },
  { id: "po-status",    icon: "Package",     label: "PO Status",             desc: "Check purchase order status",           category: "tools" as const },
  { id: "fill-rate",    icon: "BarChart2",   label: "Fill Rate",             desc: "Analyze product fill rates",            category: "tools" as const },
  { id: "kyc-flow",     icon: "FileText",    label: "KYC Verification Flow", desc: "Step-by-step compliance workflow",      category: "instructions" as const },
  { id: "invoice",      icon: "FileText",    label: "Invoice Processing",    desc: "Standard AP workflow",                  category: "instructions" as const },
] as const;

type Command = typeof COMMANDS[number];

function CommandIcon({ name, size = 16, color }: { name: string; size?: number; color: string }) {
  const props = { size, color };
  switch (name) {
    case "Database":    return <Database    {...props} />;
    case "Package":     return <Package     {...props} />;
    case "BarChart2":   return <BarChart2   {...props} />;
    case "FileText":    return <FileText    {...props} />;
    default:            return <File        {...props} />;
  }
}

function fileIconForType(type: string, name: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["xlsx", "xls", "csv"].includes(ext)) return FileSpreadsheet;
  if (["pdf", "doc", "docx", "txt"].includes(ext)) return FileText;
  if (type.startsWith("image/")) return ImageIcon;
  return File;
}

// ─────────────────────────────────────────────────────────────
// Tooltip — fixed position, viewport-clamped, 600ms delay
// ─────────────────────────────────────────────────────────────
interface TooltipState {
  top: number;
  left: number;
}

function Tooltip({
  text,
  anchorRef,
}: {
  text: string;
  anchorRef: React.RefObject<HTMLElement | null>;
}) {
  const [pos, setPos] = useState<TooltipState | null>(null);
  const tipRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    const tip = tipRef.current;
    if (!anchor || !tip) return;
    const r = anchor.getBoundingClientRect();
    const tw = tip.offsetWidth;
    let left = r.left + r.width / 2 - tw / 2;
    const top = r.bottom + 6;
    left = Math.max(8, Math.min(left, window.innerWidth - tw - 8));
    setPos({ top, left });
  }, [anchorRef]);

  return (
    <div
      ref={tipRef}
      style={{
        position: "fixed",
        zIndex: 120,
        top:  pos?.top  ?? -9999,
        left: pos?.left ?? -9999,
        opacity: pos ? 1 : 0,
        transition: "opacity 0.15s ease",
        pointerEvents: "none",
        whiteSpace: "nowrap",
        backgroundColor: ws.heading,
        color: "#fff",
        fontSize: 10,
        fontWeight: 500,
        fontFamily: f,
        padding: "4px 8px",
        borderRadius: 4,
      }}
    >
      {text}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Toolbar icon button with 600ms tooltip
// ─────────────────────────────────────────────────────────────
interface ToolbarBtnProps {
  tooltip: string;
  onClick?: () => void;
  ariaLabel: string;
  active?: boolean;
  activeStyle?: React.CSSProperties;
  children: React.ReactNode;
}

function ToolbarBtn({ tooltip, onClick, ariaLabel, active, activeStyle, children }: ToolbarBtnProps) {
  const [showTip, setShowTip] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleEnter = () => {
    timerRef.current = setTimeout(() => setShowTip(true), 600);
  };
  const handleLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setShowTip(false);
  };

  return (
    <div
      style={{ position: "relative", display: "inline-flex" }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        ref={btnRef}
        onClick={onClick}
        aria-label={ariaLabel}
        style={{
          width: 28,
          height: 28,
          borderRadius: active ? 999 : 6,
          border: "none",
          backgroundColor: active ? ws.primary : "transparent",
          color: active ? ws.onPrimary : ws.secondary,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background-color 0.15s ease, border-radius 0.15s ease, color 0.15s ease, transform 0.15s ease",
          flexShrink: 0,
          ...(active ? activeStyle : {}),
        }}
        onMouseEnter={(e) => {
          if (!active) {
            e.currentTarget.style.transform = "scale(1.15)";
            e.currentTarget.style.color = ws.primary;
          }
        }}
        onMouseLeave={(e) => {
          if (!active) {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.color = ws.secondary;
          }
        }}
      >
        {children}
      </button>
      {showTip && <Tooltip text={tooltip} anchorRef={btnRef} />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// AttachedFile type
// ─────────────────────────────────────────────────────────────
interface AttachedFile {
  file: File;
  id: string;
}

// ─────────────────────────────────────────────────────────────
// Extract content from contentEditable div
// ─────────────────────────────────────────────────────────────
function extractContent(el: HTMLDivElement): { command: Command | null; text: string } {
  const cmdSpan = el.querySelector('[data-command-id]');
  const cmdId = cmdSpan?.getAttribute('data-command-id');
  const command = cmdId ? (COMMANDS.find((c) => c.id === cmdId) ?? null) : null;

  // Clone, remove the command span, get remaining text
  const clone = el.cloneNode(true) as HTMLDivElement;
  const cloneCmd = clone.querySelector('[data-command-id]');
  if (cloneCmd) cloneCmd.remove();

  // Convert <br> to newlines then get text
  clone.querySelectorAll('br').forEach((br) => {
    br.replaceWith('\n');
  });
  // Treat div/p children as block separators
  clone.querySelectorAll('div, p').forEach((block) => {
    if (block.previousSibling) {
      block.insertBefore(document.createTextNode('\n'), block.firstChild);
    }
  });

  return { command, text: clone.textContent?.trim() ?? "" };
}

// ─────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────
export interface MessageInputProps {
  onSend: (text: string, files?: File[]) => void;
  disabled?: boolean;
}

// ─────────────────────────────────────────────────────────────
// MessageInput
// ─────────────────────────────────────────────────────────────
export function MessageInput({ onSend, disabled = false }: MessageInputProps) {
  // ── Core state ──
  const [files, setFiles] = useState<AttachedFile[]>([]);
  const [focused, setFocused] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  // Track whether editor has any content (for send button + hint)
  const [hasContent, setHasContent] = useState(false);

  // ── Voice ──
  const [recording, setRecording] = useState(false);

  // ── Slash picker ──
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerQuery, setPickerQuery] = useState("");
  const [pickerIndex, setPickerIndex] = useState(0);

  // ── Refs ──
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  // ── Update hasContent from DOM ──
  const syncHasContent = useCallback(() => {
    const el = editorRef.current;
    if (!el) {
      setHasContent(files.length > 0);
      return;
    }
    const hasCmd = !!el.querySelector('[data-command-id]');
    const textPart = (() => {
      const clone = el.cloneNode(true) as HTMLDivElement;
      clone.querySelector('[data-command-id]')?.remove();
      return clone.textContent?.trim() ?? "";
    })();
    setHasContent(hasCmd || textPart.length > 0 || files.length > 0);
  }, [files]);

  // Sync whenever files change
  useEffect(() => {
    syncHasContent();
  }, [files, syncHasContent]);

  // ── Insert command token into contentEditable ──
  const insertCommandToken = useCallback((cmd: Command) => {
    const el = editorRef.current;
    if (!el) return;

    // Remove any existing command span
    const existing = el.querySelector('[data-command-id]');
    if (existing) existing.remove();

    // Build the token span
    const span = document.createElement('span');
    span.contentEditable = 'false';
    span.setAttribute('data-command-id', cmd.id);
    span.style.cssText = [
      `background: ${ws.primaryLight}`,
      `color: ${ws.primary}`,
      'border-radius: 4px',
      'padding: 1px 5px',
      'font-size: 12px',
      'font-weight: 600',
      `font-family: ${f}`,
      'margin-right: 4px',
      'user-select: all',
      'display: inline',
    ].join('; ');
    span.textContent = `/${cmd.id}`;

    // Insert at the very beginning
    el.insertBefore(span, el.firstChild);

    // Place cursor after the span
    const selection = window.getSelection();
    if (selection) {
      const range = document.createRange();
      // If there's a text node after the span, place cursor at start of it
      const afterSpan = span.nextSibling;
      if (afterSpan && afterSpan.nodeType === Node.TEXT_NODE) {
        range.setStart(afterSpan, 0);
      } else {
        // Create a text node after span if none exists
        const textNode = document.createTextNode('\u200B'); // zero-width space workaround
        // Actually use empty string — will be cleaned on send
        const realText = document.createTextNode('');
        el.appendChild(realText);
        range.setStart(realText, 0);
      }
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }

    el.focus();
    syncHasContent();
  }, [syncHasContent]);

  // ── Slash picker trigger logic ──
  const checkSlashTrigger = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    // Get text content without the command span
    const clone = el.cloneNode(true) as HTMLDivElement;
    clone.querySelector('[data-command-id]')?.remove();
    const fullText = clone.textContent ?? '';

    // Approximate cursor offset in text-only content
    const range = selection.getRangeAt(0);
    // Walk up to find position before cursor
    let beforeCursor = '';
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    outer: while (node) {
      if (node === range.startContainer) {
        beforeCursor += (node.textContent ?? '').slice(0, range.startOffset);
        break outer;
      }
      // Skip command span children
      if ((node.parentElement as HTMLElement)?.hasAttribute?.('data-command-id')) {
        node = walker.nextNode();
        continue;
      }
      beforeCursor += node.textContent ?? '';
      node = walker.nextNode();
    }

    const lastNewline = beforeCursor.lastIndexOf('\n');
    const lineStart = lastNewline + 1;
    const lineText = beforeCursor.slice(lineStart);

    if (lineText.startsWith('/')) {
      const query = lineText.slice(1);
      setPickerQuery(query);
      setPickerOpen(true);
      setPickerIndex(0);

      // If the text content (minus command span) equals just the query text,
      // also make sure the full text we're reading is consistent
      void fullText;
      return;
    }
    setPickerOpen(false);
    setPickerQuery('');
  }, []);

  // ── Filtered commands ──
  const filteredCommands = COMMANDS.filter(
    (c) =>
      !pickerQuery ||
      c.label.toLowerCase().includes(pickerQuery.toLowerCase()) ||
      c.desc.toLowerCase().includes(pickerQuery.toLowerCase())
  );

  const toolCommands = filteredCommands.filter((c) => c.category === "tools");
  const instructionCommands = filteredCommands.filter((c) => c.category === "instructions");
  const allFiltered = [...toolCommands, ...instructionCommands];

  // ── Select command ──
  const selectCommand = useCallback(
    (cmd: Command) => {
      const el = editorRef.current;
      if (!el) return;

      // Remove any "/" query text from editor before inserting token
      // The slash text is in the text nodes (not in the command span)
      const removeSlashQuery = () => {
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        let node = walker.nextNode() as Text | null;
        while (node) {
          const parent = node.parentElement;
          if (parent?.hasAttribute('data-command-id')) {
            node = walker.nextNode() as Text | null;
            continue;
          }
          // Find and remove the /query portion
          const text = node.textContent ?? '';
          const slashIdx = text.indexOf('/');
          if (slashIdx !== -1) {
            // Remove from slash to end of that text node
            node.textContent = text.slice(0, slashIdx);
            break;
          }
          node = walker.nextNode() as Text | null;
        }
      };
      removeSlashQuery();

      insertCommandToken(cmd);
      setPickerOpen(false);
      setPickerQuery('');
    },
    [insertCommandToken]
  );

  // ── Send ──
  const handleSend = useCallback(() => {
    if (disabled) return;
    const el = editorRef.current;
    if (!el) return;

    const { command, text } = extractContent(el);
    if (!text && files.length === 0 && !command) return;

    const prefix = command ? `/${command.id} ` : '';
    onSend(prefix + text, files.map((af) => af.file));

    // Clear editor
    el.innerHTML = '';
    setFiles([]);
    setPickerOpen(false);
    setPickerQuery('');
    setRecording(false);
    setHasContent(false);
  }, [disabled, files, onSend]);

  // ── Keyboard in contentEditable ──
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (pickerOpen) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setPickerIndex((i) => Math.min(i + 1, allFiltered.length - 1));
          return;
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setPickerIndex((i) => Math.max(i - 1, 0));
          return;
        }
        if (e.key === 'Enter') {
          e.preventDefault();
          if (allFiltered[pickerIndex]) selectCommand(allFiltered[pickerIndex]);
          return;
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          setPickerOpen(false);
          setPickerQuery('');
          return;
        }
        // Backspace: if about to delete the "/" close picker
        if (e.key === 'Backspace') {
          // Will be handled, just let the default proceed then re-check
          // The input event will close picker if "/" is gone
        }
      }

      // Backspace on a command token: handled natively because span is
      // contenteditable=false + user-select:all — first backspace selects it,
      // second deletes it. No extra logic needed.

      // Send on Enter (no shift, no picker)
      if (e.key === 'Enter' && !e.shiftKey && !pickerOpen) {
        e.preventDefault();
        handleSend();
      }
    },
    [pickerOpen, allFiltered, pickerIndex, selectCommand, handleSend]
  );

  // ── Handle input event ──
  const handleInput = useCallback(() => {
    syncHasContent();
    checkSlashTrigger();
  }, [syncHasContent, checkSlashTrigger]);

  // ── File handling ──
  const addFiles = (incoming: FileList | File[]) => {
    const arr = Array.from(incoming);
    setFiles((prev) => [
      ...prev,
      ...arr.map((file) => ({ file, id: Math.random().toString(36).slice(2) })),
    ]);
  };

  const removeFile = (id: string) => setFiles((prev) => prev.filter((af) => af.id !== id));

  // ── Drag & drop ──
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  };

  // ── Paste (text + images) ──
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items);
    const imageItems = items.filter((item) => item.type.startsWith('image/'));
    if (imageItems.length > 0) {
      const imageFiles = imageItems.map((item) => item.getAsFile()).filter(Boolean) as File[];
      if (imageFiles.length) {
        e.preventDefault();
        addFiles(imageFiles);
        return;
      }
    }
    // For plain text paste: let the browser handle it by default,
    // but strip HTML to prevent styled pastes
    if (e.clipboardData.types.includes('text/html')) {
      e.preventDefault();
      const text = e.clipboardData.getData('text/plain');
      document.execCommand('insertText', false, text);
    }
    // plain text paste falls through to default
  }, []);

  // ── Voice ──
  const toggleRecording = useCallback(() => {
    const el = editorRef.current;
    setRecording((prev) => {
      if (prev) {
        // Stop recording: clear the "Listening..." span
        if (el) {
          const listeningSpan = el.querySelector('[data-listening]');
          if (listeningSpan) listeningSpan.remove();
        }
        return false;
      } else {
        // Start recording: inject the listening indicator
        if (el) {
          // Save current content? For now match original: overwrite with Listening...
          el.innerHTML = '';
          const span = document.createElement('span');
          span.setAttribute('data-listening', '1');
          span.style.color = ws.primary;
          span.textContent = 'Listening...';
          el.appendChild(span);
        }
        return true;
      }
    });
  }, []);

  // ── Close picker on outside click ──
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        pickerOpen &&
        containerRef.current &&
        !containerRef.current.contains(e.target as Node) &&
        pickerRef.current &&
        !pickerRef.current.contains(e.target as Node)
      ) {
        setPickerOpen(false);
        setPickerQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [pickerOpen]);

  // ── Computed styles ──
  const showHint = !hasContent && !pickerOpen;

  const containerBorderStyle: React.CSSProperties = isDragOver
    ? { border: `1.5px dashed ${ws.primary}`, backgroundColor: ws.primaryLight }
    : focused
    ? {
        border: `1.5px solid ${ws.primary}`,
        boxShadow: `0 0 0 1.5px ${ws.primaryLight}`,
        backgroundColor: ws.surface,
      }
    : { border: `1px solid ${ws.inputBorder}`, backgroundColor: ws.surface };

  // Whether any file chips or command tokens are shown above text area
  const hasAboveContent = files.length > 0;

  // ─────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────
  return (
    <>
      {/* Embedded keyframes + contentEditable styles */}
      <style>{`
        @keyframes mi-pulse {
          0%, 100% { opacity: 0.35; transform: scale(0.85); }
          50%       { opacity: 1;    transform: scale(1.1);  }
        }
        .mi-chip-x:hover { color: ${ws.error} !important; transform: scale(1.15) !important; }
        .mi-picker-scroll::-webkit-scrollbar { width: 3px; }
        .mi-picker-scroll::-webkit-scrollbar-track { background: transparent; }
        .mi-picker-scroll::-webkit-scrollbar-thumb { background: ${ws.inputBorder}; border-radius: 2px; }
        .mi-picker-scroll { scrollbar-width: thin; scrollbar-color: ${ws.inputBorder} transparent; }

        /* Placeholder via CSS */
        .mi-editor:empty:before,
        .mi-editor:has(> br:only-child):before {
          content: "Message Genie...";
          color: ${ws.muted_text};
          pointer-events: none;
          position: absolute;
          top: 0;
          left: 0;
        }
        /* Hide lone <br> that browsers insert into empty contentEditable */
        .mi-editor > br:only-child { display: none; }

        /* Scrollbar for the editor itself */
        .mi-editor::-webkit-scrollbar { width: 3px; }
        .mi-editor::-webkit-scrollbar-track { background: transparent; }
        .mi-editor::-webkit-scrollbar-thumb { background: ${ws.inputBorder}; border-radius: 2px; }
        .mi-editor { scrollbar-width: thin; scrollbar-color: ${ws.inputBorder} transparent; }
      `}</style>

      {/* ── Main container ── */}
      <div
        ref={containerRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          position: "relative",
          width: "100%",
          borderRadius: 14,
          overflow: "visible",
          transition: "border-color 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease",
          ...containerBorderStyle,
        }}
      >
        {/* ── Slash command picker (floats above container, anchored to it) ── */}
        {pickerOpen && (
          <div
            ref={pickerRef}
            role="listbox"
            aria-label="Commands"
            className="mi-picker-scroll"
            style={{
              position: "absolute",
              bottom: "100%",
              left: 0,
              right: 0,
              marginBottom: 6,
              backgroundColor: ws.surface,
              borderRadius: 10,
              border: `1px solid ${ws.border}`,
              boxShadow: "0 -4px 16px rgba(41,37,36,0.06)",
              maxHeight: 320,
              overflowY: "auto",
              zIndex: 60,
              fontFamily: f,
            }}
          >
            {allFiltered.length === 0 ? (
              <div style={{ padding: "14px 14px", fontSize: 12, color: ws.muted_text, fontFamily: f }}>
                No commands match &ldquo;{pickerQuery}&rdquo;
              </div>
            ) : (
              <>
                {toolCommands.length > 0 && (
                  <CommandSection
                    label="TOOLS"
                    commands={toolCommands}
                    allFiltered={allFiltered}
                    pickerIndex={pickerIndex}
                    onSelect={selectCommand}
                    onHover={(idx) => setPickerIndex(idx)}
                  />
                )}
                {toolCommands.length > 0 && instructionCommands.length > 0 && (
                  <div style={{ height: 1, backgroundColor: ws.divider, margin: "0 12px" }} />
                )}
                {instructionCommands.length > 0 && (
                  <CommandSection
                    label="INSTRUCTIONS"
                    commands={instructionCommands}
                    allFiltered={allFiltered}
                    pickerIndex={pickerIndex}
                    onSelect={selectCommand}
                    onHover={(idx) => setPickerIndex(idx)}
                  />
                )}
              </>
            )}
          </div>
        )}

        {/* ── File chips zone ── */}
        {files.length > 0 && (
          <>
            <div
              style={{
                padding: "10px 10px 0",
                display: "flex",
                flexWrap: "wrap" as const,
                gap: 8,
              }}
            >
              {files.map(({ file, id }) => {
                const IconComp = fileIconForType(file.type, file.name);
                return (
                  <div
                    key={id}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      backgroundColor: ws.elevated,
                      borderRadius: 4,
                      padding: "2px 5px 2px 5px",
                      maxWidth: 180,
                      height: 22,
                    }}
                  >
                    <IconComp size={10} color={ws.muted_text} style={{ flexShrink: 0 }} />
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 500,
                        color: ws.body,
                        fontFamily: f,
                        maxWidth: 130,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap" as const,
                      }}
                    >
                      {file.name}
                    </span>
                    <button
                      onClick={() => removeFile(id)}
                      aria-label={`Remove ${file.name}`}
                      className="mi-chip-x"
                      style={{
                        width: 16,
                        height: 16,
                        border: "none",
                        backgroundColor: "transparent",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 0,
                        color: ws.muted_text,
                        transition: "color 0.15s ease, transform 0.15s ease",
                        flexShrink: 0,
                      }}
                    >
                      <X size={8} color="currentColor" />
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ── Soft divider when context (file chips) exists above text ── */}
        {hasAboveContent && (
          <div style={{ height: 1, backgroundColor: ws.divider, marginTop: 8 }} />
        )}

        {/* ── ContentEditable editor zone ── */}
        <div
          style={{
            padding: hasAboveContent ? "10px 16px 6px" : "14px 16px 6px",
            position: "relative",
          }}
        >
          <div
            ref={editorRef}
            role="textbox"
            aria-label="Message"
            aria-multiline="true"
            contentEditable={recording ? false : !disabled}
            suppressContentEditableWarning
            className="mi-editor"
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={{
              width: "100%",
              minHeight: 20,
              maxHeight: 100,
              overflowY: "auto",
              fontSize: 14,
              fontWeight: 400,
              fontFamily: f,
              color: ws.body,
              lineHeight: "20px",
              outline: "none",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              position: "relative",
              boxSizing: "border-box" as const,
            }}
          />
          {/* Voice recording dots */}
          {recording && (
            <div style={{ display: "flex", gap: 4, marginTop: 6, marginBottom: 4, alignItems: "center" }}>
              {[0, 0.2, 0.4].map((delay, i) => (
                <div
                  key={i}
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    backgroundColor: ws.primary,
                    animation: `mi-pulse 1s ease ${delay}s infinite`,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Hairline separator — full width ── */}
        <div style={{ height: 1, backgroundColor: ws.divider }} />

        {/* ── Toolbar zone ── */}
        <div
          style={{
            padding: "8px 12px",
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxSizing: "border-box" as const,
          }}
        >
          {/* Left group */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {/* Paperclip */}
            <ToolbarBtn
              tooltip="Attach files"
              ariaLabel="Attach files"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip size={15} color="currentColor" />
            </ToolbarBtn>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="*/*"
              style={{ display: "none" }}
              onChange={(e) => {
                if (e.target.files?.length) {
                  addFiles(e.target.files);
                  e.target.value = "";
                }
              }}
            />

            {/* Slash command */}
            <ToolbarBtn
              tooltip="Commands & instructions /"
              ariaLabel="Commands and instructions"
              onClick={() => {
                if (!pickerOpen) {
                  const el = editorRef.current;
                  if (el) {
                    // Check if text already starts with "/"
                    const clone = el.cloneNode(true) as HTMLDivElement;
                    clone.querySelector('[data-command-id]')?.remove();
                    const currentText = clone.textContent ?? '';
                    if (!currentText.trimStart().startsWith('/')) {
                      // Insert "/" at cursor position (or end)
                      el.focus();
                      const selection = window.getSelection();
                      if (selection && selection.rangeCount > 0) {
                        const range = selection.getRangeAt(0);
                        range.deleteContents();
                        const textNode = document.createTextNode('/');
                        range.insertNode(textNode);
                        range.setStartAfter(textNode);
                        range.collapse(true);
                        selection.removeAllRanges();
                        selection.addRange(range);
                      } else {
                        document.execCommand('insertText', false, '/');
                      }
                    }
                  }
                  setPickerQuery('');
                  setPickerOpen(true);
                  setPickerIndex(0);
                } else {
                  setPickerOpen(false);
                  setPickerQuery('');
                }
              }}
            >
              <SlashSquareIcon size={15} color="currentColor" />
            </ToolbarBtn>

            {/* Hint text — next to the / button it references */}
            <span
              style={{
                fontSize: 11,
                fontWeight: 400,
                color: ws.muted_text,
                fontFamily: f,
                opacity: showHint ? 1 : 0,
                transition: "opacity 0.15s ease",
                pointerEvents: "none",
                userSelect: "none" as const,
                marginLeft: 2,
              }}
            >
              Type / for commands
            </span>
          </div>

          {/* Right group */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {/* Mic */}
            <ToolbarBtn
              tooltip="Voice input"
              ariaLabel={recording ? "Stop voice recording" : "Voice input"}
              onClick={toggleRecording}
              active={recording}
            >
              <Mic
                size={15}
                color="currentColor"
              />
            </ToolbarBtn>

            {/* Send */}
            <SendButton hasContent={hasContent} disabled={disabled} onClick={handleSend} />
          </div>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Send button
// ─────────────────────────────────────────────────────────────
function SendButton({
  hasContent,
  disabled,
  onClick,
}: {
  hasContent: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const enabled = hasContent && !disabled;

  const bg = enabled
    ? hovered
      ? ws.primaryHover
      : ws.primary
    : ws.elevated;

  return (
    <button
      onClick={enabled ? onClick : undefined}
      aria-label="Send message"
      style={{
        width: 28,
        height: 28,
        borderRadius: 7,
        border: "none",
        backgroundColor: bg,
        cursor: enabled ? "pointer" : "default",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background-color 0.15s ease",
        flexShrink: 0,
      }}
      onMouseEnter={() => { if (enabled) setHovered(true); }}
      onMouseLeave={() => setHovered(false)}
    >
      <ArrowUp size={14} color={enabled ? ws.onPrimary : ws.muted_text} />
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Command section (TOOLS / INSTRUCTIONS)
// ─────────────────────────────────────────────────────────────
function CommandSection({
  label,
  commands,
  allFiltered,
  pickerIndex,
  onSelect,
  onHover,
}: {
  label: string;
  commands: readonly Command[];
  allFiltered: readonly Command[];
  pickerIndex: number;
  onSelect: (cmd: Command) => void;
  onHover: (idx: number) => void;
}) {
  return (
    <div>
      {/* Section header */}
      <div
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.6px",
          textTransform: "uppercase" as const,
          color: ws.muted_text,
          fontFamily: f,
          padding: "10px 14px 4px",
        }}
      >
        {label}
      </div>

      {/* Rows */}
      {commands.map((cmd) => {
        const globalIdx = allFiltered.findIndex((c) => c.id === cmd.id);
        const isSelected = globalIdx === pickerIndex;

        return (
          <CommandRow
            key={cmd.id}
            cmd={cmd}
            isSelected={isSelected}
            globalIdx={globalIdx}
            onSelect={onSelect}
            onHover={onHover}
          />
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Command row
// ─────────────────────────────────────────────────────────────
function CommandRow({
  cmd,
  isSelected,
  globalIdx,
  onSelect,
  onHover,
}: {
  cmd: Command;
  isSelected: boolean;
  globalIdx: number;
  onSelect: (cmd: Command) => void;
  onHover: (idx: number) => void;
}) {
  const [hovered, setHovered] = useState(false);

  const bg = isSelected
    ? ws.elevated
    : hovered
    ? ws.hoverBg
    : "transparent";

  const iconColor = isSelected ? ws.primary : ws.muted_text;
  const labelColor = isSelected ? ws.heading : ws.body;

  return (
    <div
      role="option"
      aria-selected={isSelected}
      onClick={() => onSelect(cmd)}
      onMouseEnter={() => { setHovered(true); onHover(globalIdx); }}
      onMouseLeave={() => setHovered(false)}
      style={{
        height: 40,
        padding: "0 12px",
        borderRadius: 7,
        margin: "0 4px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        cursor: "pointer",
        backgroundColor: bg,
        transition: "background-color 0.1s ease",
      }}
    >
      <CommandIcon name={cmd.icon} size={16} color={iconColor} />
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 1, minWidth: 0, flex: 1 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: labelColor, fontFamily: f, lineHeight: "16px" }}>
          {cmd.label}
        </span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 400,
            color: ws.muted_text,
            fontFamily: f,
            lineHeight: "14px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap" as const,
          }}
        >
          {cmd.desc}
        </span>
      </div>
    </div>
  );
}
