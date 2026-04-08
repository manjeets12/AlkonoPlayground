import React from "react";
import styles from "./DeviceFrame.module.css";

interface DeviceFrameProps {
  children: React.ReactNode;
  active: boolean;
}

export default function DeviceFrame({ children, active }: DeviceFrameProps) {
  if (!active) {
    return <div className={styles.noFrame}>{children}</div>;
  }

  return (
    <div className={styles.container}>
      {/* ── Outer Shell ─────────────────────────────────────────────── */}
      <div className={styles.device}>
        {/* Buttons (Hardware) */}
        <div className={styles.silentSwitch} />
        <div className={styles.volumeUp} />
        <div className={styles.volumeDown} />
        <div className={styles.powerBtn} />

        {/* ── Inner Screen ───────────────────────────────────────────── */}
        <div className={styles.screen}>
          {/* Hardware Details on screen */}
          <div className={styles.notch}>
            <div className={styles.speaker} />
            <div className={styles.camera} />
          </div>

          <div className={styles.screenContent}>
            {children}
          </div>

          <div className={styles.homeIndicator} />
        </div>
      </div>
    </div>
  );
}
