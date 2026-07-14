import { X } from "lucide-react";
import type { ReactNode } from "react";
import updatePopupMarkdown from "../content/updatePopup.md?raw";

export const DISCORD_INVITE_URL = "https://discord.gg/p2HQH6jUbf";
export const DISCORD_INVITE_LOGO_SRC = "/Discord-Symbol-Blurple.svg";
export const DISCORD_SETTINGS_BANNER_BODY = "BETA TEST FEEDBACK DISCORD SERVER";

export const UPDATE_POPUP_STORAGE_PREFIX = "ctroadmap.updatePopup.";

interface DiscordInviteButtonProps {
  className?: string;
  onInviteClick?: () => void;
}

export function DiscordInviteButton({ className, onInviteClick }: DiscordInviteButtonProps) {
  return (
    <a
      className={["discord-invite-button", className ?? ""].filter(Boolean).join(" ")}
      href={DISCORD_INVITE_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onInviteClick}
    >
      <img src={DISCORD_INVITE_LOGO_SRC} alt="" aria-hidden="true" />
      <span>JOIN HERE</span>
    </a>
  );
}

interface UpdatePopupModalProps {
  currentVersion: string;
  onClose: () => void;
  onInviteClick: () => void;
}

export function UpdatePopupModal({ currentVersion, onClose, onInviteClick }: UpdatePopupModalProps) {
  return (
    <div className="update-popup-backdrop" role="presentation">
      <section className="update-popup" role="dialog" aria-modal="true" aria-labelledby="update-popup-title">
        <button className="update-popup__close" type="button" onClick={onClose} aria-label="Close update pop-up">
          <X size={20} />
        </button>
        <div className="update-popup__brand">
          <span>Welcome to {currentVersion}</span>
        </div>
        <h2 id="update-popup-title">Update Notes</h2>
        <div className="update-popup__body">{renderMarkdown(updatePopupMarkdown)}</div>
        <div className="update-popup__actions">
          <DiscordInviteButton className="discord-invite-button--modal" onInviteClick={onInviteClick} />
        </div>
      </section>
    </div>
  );
}

export function DiscordInviteSettingsBanner() {
  return (
    <div className="discord-invite-banner">
      <div className="discord-invite-banner__copy">
        <img src={DISCORD_INVITE_LOGO_SRC} alt="" aria-hidden="true" />
        <strong>{DISCORD_SETTINGS_BANNER_BODY}</strong>
      </div>
      <DiscordInviteButton className="discord-invite-button--banner" />
    </div>
  );
}

function renderMarkdown(markdown: string): ReactNode[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const nodes: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }

    const bulletMatch = line.match(/^\s*[-*]\s+(.+)$/);
    if (bulletMatch) {
      const items: string[] = [];
      while (index < lines.length) {
        const itemMatch = lines[index].match(/^\s*[-*]\s+(.+)$/);
        if (!itemMatch) break;
        items.push(itemMatch[1]);
        index += 1;
      }
      nodes.push(
        <ul key={`list-${nodes.length}`}>
          {items.map((item, itemIndex) => (
            <li key={`${item}-${itemIndex}`}>{renderInlineMarkdown(item, `list-${nodes.length}-${itemIndex}`)}</li>
          ))}
        </ul>
      );
      continue;
    }

    const paragraphLines: string[] = [];
    while (index < lines.length && lines[index].trim() && !lines[index].match(/^\s*[-*]\s+(.+)$/)) {
      paragraphLines.push(lines[index].trim());
      index += 1;
    }
    nodes.push(
      <p key={`paragraph-${nodes.length}`}>
        {paragraphLines.flatMap((paragraphLine, lineIndex) => [
          ...(lineIndex > 0 ? [<br key={`br-${nodes.length}-${lineIndex}`} />] : []),
          ...renderInlineMarkdown(paragraphLine, `paragraph-${nodes.length}-${lineIndex}`)
        ])}
      </p>
    );
  }

  return nodes;
}

function renderInlineMarkdown(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const tokenPattern = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let tokenIndex = 0;

  while ((match = tokenPattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    if (match[1] && match[2]) {
      nodes.push(
        <a key={`${keyPrefix}-link-${tokenIndex}`} href={match[2]} target="_blank" rel="noopener noreferrer">
          {match[1]}
        </a>
      );
    } else if (match[3]) {
      nodes.push(<strong key={`${keyPrefix}-strong-${tokenIndex}`}>{match[3]}</strong>);
    } else if (match[4]) {
      nodes.push(<em key={`${keyPrefix}-em-${tokenIndex}`}>{match[4]}</em>);
    }

    lastIndex = tokenPattern.lastIndex;
    tokenIndex += 1;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}
