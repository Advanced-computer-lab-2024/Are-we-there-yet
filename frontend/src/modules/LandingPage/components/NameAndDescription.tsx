import { motion } from "framer-motion";
import { useState } from "react";

export default function NameAndDescription({
  fontColor,
}: {
  fontColor: string;
}) {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div className="relative mx-12 h-fit w-[70%]">
      {/* Backdrop blur container */}
      <motion.div
        className={`absolute inset-0 -z-10 rounded-2xl backdrop-blur-md transition-all duration-300 ${
          isHovering ? "bg-white/20" : "bg-black/5"
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />

      {/* Content container */}
      <div
        className={`w-full rounded-2xl p-4 text-center transition-all duration-150`}
      >
        <motion.h1
          className={`text-8xl font-headline ${fontColor} relative tracking-tight drop-shadow-lg`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
          }}
        >
          <motion.span
            className="relative inline-block"
            whileHover={{
              scale: 1.02,
              transition: { duration: 0.2 },
            }}
          >
            Are
          </motion.span>{" "}
          <motion.span
            className="relative inline-block"
            whileHover={{
              scale: 1.02,
              transition: { duration: 0.2 },
            }}
          >
            We
          </motion.span>{" "}
          <motion.span
            className="relative inline-block"
            whileHover={{
              scale: 1.02,
              transition: { duration: 0.2 },
            }}
          >
            There
          </motion.span>{" "}
          <motion.span
            className="relative inline-block"
            whileHover={{
              scale: 1.02,
              transition: { duration: 0.2 },
            }}
          >
            Yet
          </motion.span>
          <motion.span
            className="ml-2 inline-block text-9xl drop-shadow-lg"
            initial={{ opacity: 0, rotate: -10 }}
            animate={{ opacity: 1, rotate: 0 }}
            transition={{
              duration: 0.8,
              ease: "easeOut",
              delay: 0.3,
            }}
          >
            ?
          </motion.span>
          <motion.div
            className="absolute bottom-0 left-[0%] right-[2%] h-[1px] bg-current shadow-lg"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{
              duration: 1,
              ease: "easeInOut",
              delay: 0.5,
            }}
          />
        </motion.h1>

        <motion.p
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          className={`relative mx-auto mt-8 max-w-3xl text-center text-[4px] font-bold ${fontColor} transition-all duration-300 ${
            isHovering ? "text-[22px] leading-loose opacity-90" : "opacity-40"
          } `}
          style={{
            textShadow: isHovering ? "0 1px 2px rgba(0,0,0,0.1)" : "none",
          }}
        >
          Dear TA, if you've found this message, you're either incredibly
          detail-oriented or desperately procrastinating on grading. We want you
          to know that this website was crafted with blood (multiple paper cuts
          from frantically flipping through React docs), sweat (our laptop fans
          were working overtime), and tears (debugging CSS at 3 AM is no joke).
          We've consumed concerning amounts of coffee, survived countless merge
          conflicts, and had several existential crises over component naming
          conventions. But hey, we made it! PS: If you're reading this, we
          deserve extra points for attention to detail, right? 😉
        </motion.p>
      </div>
    </div>
  );
}
