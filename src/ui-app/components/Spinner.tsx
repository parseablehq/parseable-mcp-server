export function Spinner() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 rounded-full border-[3px] border-parseableBlue-500 border-t-transparent animate-spin" />
    </div>
  );
}
