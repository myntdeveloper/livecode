import React from "react";

interface Participant {
  id: string;
  name: string;
  color: string;
  gradient: string;
  online: boolean;
}

interface ParticipantsListProps {
  participants: Participant[];
  onAvatarClick?: () => void;
}

export function ParticipantsList({ participants, onAvatarClick }: ParticipantsListProps) {
  return (
    <div className="flex items-center gap-3">
      
      <div className="flex -space-x-2">
        {participants.slice(0, 5).map((participant, index) => (
          null
        ))}
        {participants.length > 5 && (
          <div className="w-9 h-9 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-semibold">
            +{participants.length - 5}
          </div>
        )}
      </div>
    </div>
  );
}
