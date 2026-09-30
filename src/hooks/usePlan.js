import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";

// Live subscription to users/{uid}: updates as soon as the webhook writes the plan
export function usePlan() {
  const { user } = useAuth();
  const [plan, setPlan] = useState("free");

  useEffect(() => {
    if (!user) return;
    return onSnapshot(
      doc(db, "users", user.uid),
      (snap) => setPlan(snap.data()?.plan ?? "free"),
      (err) => console.error("Unable to read plan:", err),
    );
  }, [user]);

  return plan;
}
