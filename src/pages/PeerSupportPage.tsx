import { motion } from "framer-motion";
import { Users } from "lucide-react";

const PeerSupportPage = () => {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-16 md:py-24 text-center">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center"
      >
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Users size={28} className="text-primary" />
        </div>
        <h2 className="mb-2 font-display text-2xl font-bold text-foreground md:text-3xl">Peer Support</h2>
        <p className="mb-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
          Structured, safe human connection, matched by shared experience, not algorithms.
        </p>
        <p className="text-xs text-muted-foreground/50">
          Coming soon, to make your life easier.
        </p>
      </motion.div>
    </div>
  );
};

export default PeerSupportPage;
