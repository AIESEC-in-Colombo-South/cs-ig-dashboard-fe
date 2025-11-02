
import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SkipForward } from "lucide-react";
import csLogo from "@/public/cs_logo.jpg";

export default function SplashScreen({ onDone }: { onDone: () => void }) {
  const prefersReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    const id = setTimeout(onDone, prefersReduced ? 600 : 2200);
    return () => clearTimeout(id);
  }, [onDone, prefersReduced]);

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 bg-white grid place-items-center" initial={{ opacity: 1 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 120, damping: 14 }}
          className="relative isolate flex flex-col items-center text-center px-6">
          <motion.div className="absolute -inset-8 -z-10 rounded-full bg-gradient-to-r from-[#0A3B78] via-[#1354A0] to-[#8CC641] blur-2xl pointer-events-none"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}/>

          <div className="relative">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-xl shadow-blue-900/25">
              <img src={csLogo} alt="AIESEC CS logo" className="h-[90%] object-contain" />
            </div>
          </div>

          <motion.h1 className="mt-5 text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900"
            initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15, duration: 0.45 }}>
            Hackathon Dashboard
          </motion.h1>

          <motion.p className="mt-2 text-sm md:text-base text-slate-600" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.4 }}>
            Build. Learn. Compete. <span className="text-slate-900 font-medium">Let the best campus win.</span>
          </motion.p>

          <motion.div className="mt-6 h-1 w-56 bg-slate-200 rounded-full overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
            <motion.div className="h-full bg-blue-600" initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: prefersReduced ? 0.4 : 1.6, ease: "easeInOut" }} />
          </motion.div>

          <Button variant="ghost" size="sm" className="mt-4" onClick={onDone}>
            <SkipForward className="h-4 w-4 mr-2" /> Skip
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
