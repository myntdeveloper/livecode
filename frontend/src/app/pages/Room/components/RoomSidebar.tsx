import React from "react";
import { Users } from "lucide-react";
import { LanguageSelector } from "../../../components/LanguageSelector";
import type { Participant } from "../types";

interface RoomSidebarProps {
  language: string;
  participants: Participant[];
  isOwner: boolean;
  currentUserId: string;
  onLanguageChange: (language: string) => void;
  onParticipantClick: (participant: Participant, index: number) => void;
  t: (key: string) => string;
}

export function RoomSidebar({
  language,
  participants,
  isOwner,
  currentUserId,
  onLanguageChange,
  onParticipantClick,
  t,
}: RoomSidebarProps) {
  return (
    <aside className="h-full border-r border-border/50 bg-card/30 backdrop-blur-sm flex flex-col">
      <div className="p-4 border-b border-border/50">
        <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          {t("room.language")}
        </h3>
        <LanguageSelector
          value={language}
          onChange={onLanguageChange}
          disabled={!isOwner}
        />
      </div>
      <div className="p-4 flex-1 overflow-auto">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {t("room.participants")} ({participants.length})
          </h3>
        </div>
        <div className="space-y-2">
          {participants.map((participant, index) => (
            <button
              key={participant.id}
              onClick={() => onParticipantClick(participant, index)}
              className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-all group"
              disabled={!isOwner || participant.id === currentUserId}
            >
              {participant.avatarUrl ? (
                <img
                  src={participant.avatarUrl}
                  alt={participant.name}
                  className="w-9 h-9 rounded-full object-cover shadow-lg"
                />
              ) : (
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold bg-gradient-to-br ${participant.gradient} shadow-lg`}
                >
                  {participant.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-sm flex-1 text-left">{participant.name}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
