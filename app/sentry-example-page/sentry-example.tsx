"use client";
import * as Sentry from "@sentry/nextjs";
import { useState, useEffect } from "react";
import styles from "./sentry-example.module.css";

class SentryExampleFrontendError extends Error {
  constructor(message: string | undefined) {
    super(message);
    this.name = "SentryExampleFrontendError";
  }
}

const SentryExamplePage = () => {
  const [hasSentError, setHasSentError] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    async function checkConnectivity() {
      const result = await Sentry.diagnoseSdkConnectivity();
      setIsConnected(result !== "sentry-unreachable");
    }
    checkConnectivity();
  }, []);

  return (
    <>
      <button
        className={styles.button}
        type="button"
        onClick={async () => {
          await Sentry.startSpan(
            {
              name: "Example Frontend/Backend Span",
              op: "test",
            },
            async () => {
              const res = await fetch("/next-api/sentry-example-api");
              if (!res.ok) {
                setHasSentError(true);
              }
            }
          );
          throw new SentryExampleFrontendError(
            "This error is raised on the frontend of the example page."
          );
        }}
        disabled={!isConnected}
      >
        <span className={styles.span}>Throw Sample Error</span>
      </button>

      {hasSentError ? (
        <p className={`${styles.p} ${styles.success}`}>Error sent to Sentry.</p>
      ) : !isConnected ? (
        <div className={styles.error}>
          <p className={styles.p}>
            It looks like network requests to Sentry are being blocked, which
            will prevent errors from being captured. Try disabling your
            ad-blocker to complete the test.
          </p>
        </div>
      ) : (
        <div className={styles.success_placeholder} />
      )}
    </>
  );
};
export default SentryExamplePage;
