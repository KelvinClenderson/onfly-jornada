import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageSquare, X } from "lucide-react";

const quickChips = [
  { emoji: "✈", label: "Voo direto", text: "prefiro voo direto sem escalas" },
  { emoji: "🌙", label: "Voo noturno", text: "prefiro voos noturnos" },
  { emoji: "🌅", label: "Voo matutino", text: "prefiro voos de manhã" },
  { emoji: "🏨", label: "Hotel 4★+", text: "quero hotel 4 estrelas ou mais" },
  { emoji: "🏢", label: "Hotel próx. ao evento", text: "o hotel deve ser próximo ao local do evento" },
  { emoji: "🛫", label: "Hotel próx. ao aeroporto", text: "o hotel deve ser próximo ao aeroporto" },
  { emoji: "🍳", label: "Café incluso", text: "hotel com café da manhã incluso" },
  { emoji: "🏋", label: "Com academia", text: "hotel com academia" },
  { emoji: "🚗", label: "Prefiro 99", text: "usar o 99 para transporte terrestre" },
  { emoji: "🚙", label: "Prefiro Uber", text: "usar Uber para transporte terrestre" },
  { emoji: "🔵", label: "Prefiro LATAM", text: "prefiro voos da LATAM" },
  { emoji: "🟠", label: "Prefiro GOL", text: "prefiro voos da GOL" },
  { emoji: "🔴", label: "Prefiro Azul", text: "prefiro voos da Azul" },
  { emoji: "🛑", label: "Sem carro alugado", text: "não quero aluguel de carro" },
];

const MAX_CHARS = 300;

interface PreferencesStepProps {
  value: string;
  onChange: (value: string) => void;
}

const PreferencesStep = ({ value, onChange }: PreferencesStepProps) => {
  const [selectedChips, setSelectedChips] = useState<Set<number>>(new Set());
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.max(88, textareaRef.current.scrollHeight) + "px";
    }
  }, [value]);

  const handleChipClick = (index: number) => {
    const chip = quickChips[index];
    const newSelected = new Set(selectedChips);

    if (newSelected.has(index)) {
      newSelected.delete(index);
      const newValue = value
        .replace(chip.text, "")
        .replace(/,\s*,/g, ",")
        .replace(/^,\s*|,\s*$/g, "")
        .trim();
      onChange(newValue);
    } else {
      const separator = value.trim() ? ", " : "";
      const newValue = value.trim() + separator + chip.text;
      if (newValue.length <= MAX_CHARS) {
        newSelected.add(index);
        onChange(newValue);
      }
    }
    setSelectedChips(newSelected);
  };

  const handleClear = () => {
    onChange("");
    setSelectedChips(new Set());
  };

  const handleTextChange = (text: string) => {
    if (text.length <= MAX_CHARS) {
      onChange(text);
    }
  };

  return (
    <motion.div
      className="bg-card border border-card-border rounded-xl p-5 mt-5"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">
            Alguma preferência especial para esta viagem?
          </span>
          <span className="text-xs text-muted-foreground/60">(opcional)</span>
        </div>
        {value && (
          <button
            onClick={handleClear}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Limpar preferências"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder='Ex: quero voo da LATAM, hotel próximo ao aeroporto e transporte pelo 99...'
          className="w-full min-h-[88px] resize-none bg-secondary border border-card-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-card transition-all"
          maxLength={MAX_CHARS}
        />
        <span className="absolute bottom-2 right-3 text-xs text-muted-foreground/60">
          {value.length} / {MAX_CHARS}
        </span>
      </div>

      <div className="mt-3">
        <p className="text-xs text-muted-foreground mb-2">Sugestões rápidas:</p>
        <div className="flex flex-wrap gap-2 max-[375px]:flex-nowrap max-[375px]:overflow-x-auto max-[375px]:pb-2">
          {quickChips.map((chip, i) => (
            <button
              key={i}
              onClick={() => handleChipClick(i)}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap ${
                selectedChips.has(i)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-primary/5 text-primary border-primary/20 hover:bg-primary/10"
              }`}
            >
              <span>{chip.emoji}</span>
              {chip.label}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default PreferencesStep;
