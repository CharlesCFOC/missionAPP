"use client";

interface BaseInputProps {
  className?: string;
  placeholder: string;
}

interface TextInputProps extends BaseInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const TextInput = ({ value, onChange, placeholder, className = "" }: TextInputProps) => (
  <input
    value={value}
    onChange={(event) => onChange(event.target.value)}
    placeholder={placeholder}
    className={`w-full px-3 py-2 rounded-lg bg-white/5 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#ff9c4b] ${className}`}
  />
);

export const Textarea = ({
  value,
  onChange,
  placeholder,
  className = "",
}: TextInputProps) => (
  <textarea
    value={value}
    onChange={(event) => onChange(event.target.value)}
    placeholder={placeholder}
    className={`w-full px-3 py-2 rounded-lg bg-white/5 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-[#ff9c4b] ${className}`}
  />
);

interface DateInputProps extends Pick<TextInputProps, "value" | "onChange" | "className"> {
  placeholder?: string;
}

export const DateInput = ({ value, onChange, className = "" }: DateInputProps) => (
  <input
    type="date"
    value={value}
    onChange={(event) => onChange(event.target.value)}
    className={`w-full px-3 py-2 rounded-lg bg-white/5 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-[#ff9c4b] [color-scheme:dark] ${className}`}
  />
);
