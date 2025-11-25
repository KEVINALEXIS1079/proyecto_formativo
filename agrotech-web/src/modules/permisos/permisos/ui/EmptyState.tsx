export default function EmptyState({ text }: { text: string }) {
  return (
    <div className="w-full text-center text-sm opacity-70 py-6">{text}</div>
  );
}
