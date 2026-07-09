import { X } from "lucide-react";

export const DISCORD_INVITE_URL = "https://discord.gg/p2HQH6jUbf";
export const DISCORD_INVITE_VERSION = "0.2.0-beta";
export const DISCORD_INVITE_STORAGE_KEY = `ctroadmap.discordInvite.${DISCORD_INVITE_VERSION}`;
export const DISCORD_INVITE_LOGO_SRC = "/Discord-Symbol-Blurple.svg";

export const DISCORD_INVITE_TITLE = "BIG MILESTONE REACHED - THANK YOU !!";
export const DISCORD_SETTINGS_BANNER_BODY = "BETA TEST FEEDBACK DISCORD SERVER";

export const DISCORD_INVITE_PARAGRAPHS = [
  "So CTRoadmap has passed the 100 download mark (which is huge, you all rock) and with this many people trying out the App I thought it might be a good idea to give you a method of providing direct feedback... asking any questions you have ... reporting bugs you've discovered, etc.",
  "So I've started a small DISCORD server for you to do that if you'd like. THIS IS NOT an attempt at some community style social server built around a single little App... that would be absurd, and embarrassing for both of us. Just a simple portal for easy answers & extra info. Thanks again, I really hope you're enjoying the App. - NoobCity99"
];
export const DISCORD_INVITE_FOOTNOTE = "(this only pops up twice, after that I'll shut up about it)";

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

interface DiscordInviteModalProps {
  onClose: () => void;
  onInviteClick: () => void;
}

export function DiscordInviteModal({ onClose, onInviteClick }: DiscordInviteModalProps) {
  return (
    <div className="discord-invite-modal-backdrop" role="presentation">
      <section className="discord-invite-modal" role="dialog" aria-modal="true" aria-labelledby="discord-invite-title">
        <button className="discord-invite-modal__close" type="button" onClick={onClose} aria-label="Close Discord invite">
          <X size={20} />
        </button>
        <div className="discord-invite-modal__brand">
          <img src={DISCORD_INVITE_LOGO_SRC} alt="" aria-hidden="true" />
          <span>Discord feedback portal</span>
        </div>
        <h2 id="discord-invite-title">{DISCORD_INVITE_TITLE}</h2>
        <div className="discord-invite-modal__body">
          {DISCORD_INVITE_PARAGRAPHS.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <p className="discord-invite-modal__footnote">{DISCORD_INVITE_FOOTNOTE}</p>
        </div>
        <div className="discord-invite-modal__actions">
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
