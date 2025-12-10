import { useState, useRef, useEffect } from "react";
import { Input, Button } from "@heroui/react";

export type AuthCodeValues = { codigo: string };

export default function AuthCodeForm({
  onSubmit,
  loading
}: {
  onSubmit: (v: AuthCodeValues) => void;
  loading?: boolean;
}) {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index: number, value: string) => {
    // Only numbers
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...digits];
    // Take the last character if user types more than 1 (unlikely with maxLength=1 but possible on some inputs)
    // Actually standard behavior is to replace.
    newDigits[index] = value.slice(-1); 
    setDigits(newDigits);

    // Auto-advance
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit if all filled? (Optional, maybe wait for button)
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      // If empty and backspace, go back
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (!/^\d+$/.test(pastedData)) return; // Only numbers

    const newDigits = [...digits];
    const chars = pastedData.split("").slice(0, 6);
    
    chars.forEach((char, i) => {
        newDigits[i] = char;
    });
    setDigits(newDigits);

    // Focus appropriate input
    const nextFocus = Math.min(chars.length, 5);
    inputRefs.current[nextFocus]?.focus();
  };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    e.stopPropagation();
    const codigo = digits.join("");
    onSubmit({ codigo });
  }

  // Ensure refs array is sized correctly
  inputRefs.current = inputRefs.current.slice(0, 6);

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate>
      <div className="flex gap-2 justify-center">
        {digits.map((digit, index) => (
          <div key={index} className="w-12 h-14">
             <Input
                // @ts-ignore - HeroUI ref typing can be tricky, using any for safety if needed or standard ref
                ref={(el) => (inputRefs.current[index] = el)}
                value={digit}
                onValueChange={(val) => handleChange(index, val)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                maxLength={1}
                classNames={{
                    input: "text-center text-lg font-bold",
                    inputWrapper: "h-full px-1"
                }}
                inputMode="numeric"
                radius="md"
                variant="bordered"
                aria-label={`Digit ${index + 1}`}
            />
          </div>
        ))}
      </div>

      <Button
        type="submit"
        color="success"
        className="w-full rounded-full"
        isLoading={loading}
        onPress={() => onSubmit({ codigo: digits.join("") })}
        isDisabled={digits.some(d => d === "")}
      >
        Verificar
      </Button>
    </form>
  );
}
