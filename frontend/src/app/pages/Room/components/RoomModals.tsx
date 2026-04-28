import React from "react";
import { Button } from "../../../components/ui/Button";
import { Modal } from "../../../components/ui/Modal";
import type { Participant } from "../types";

interface RoomModalsProps {
  kickTarget: Participant | null;
  isOwner: boolean;
  isEndSessionModalOpen: boolean;
  onKickCancel: () => void;
  onKickConfirm: () => void;
  onEndSessionCancel: () => void;
  onEndSessionConfirm: () => void;
  t: (key: string) => string;
}

export function RoomModals({
  kickTarget,
  isOwner,
  isEndSessionModalOpen,
  onKickCancel,
  onKickConfirm,
  onEndSessionCancel,
  onEndSessionConfirm,
  t,
}: RoomModalsProps) {
  return (
    <>
      <Modal
        isOpen={Boolean(kickTarget)}
        onClose={onKickCancel}
        title={t("room.kickTitle")}
      >
        <p className="text-sm text-muted-foreground">
          {t("room.kickConfirm")}{" "}
          <span className="text-foreground font-medium">{kickTarget?.name}</span>
          ?
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onKickCancel}>
            {t("common.cancel")}
          </Button>
          <Button onClick={onKickConfirm} disabled={!isOwner}>
            {t("room.kickAction")}
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={isEndSessionModalOpen}
        onClose={onEndSessionCancel}
        title={t("room.closeLobby")}
      >
        <p className="text-sm text-muted-foreground">{t("room.closeLobbyConfirm")}</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onEndSessionCancel}>
            {t("common.cancel")}
          </Button>
          <Button onClick={onEndSessionConfirm}>{t("room.closeLobbyAction")}</Button>
        </div>
      </Modal>
    </>
  );
}
