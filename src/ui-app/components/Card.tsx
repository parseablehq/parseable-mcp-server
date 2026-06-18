import { ReactNode } from "react";
import { LeftPanel } from "./LeftPanel";

export function TwoColumnCard({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-[#F3F4F6] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-6xl">
        <div className="w-full rounded-[28px] shadow-[0_24px_60px_rgba(0,0,0,0.14)] overflow-hidden bg-white">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <LeftPanel />
            <div className="p-8 sm:p-10 lg:p-12 min-h-[26rem] flex flex-col justify-center">
              <div className="max-w-md w-full mx-auto flex-1 flex flex-col justify-center gap-8">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CenteredCard({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-[#F3F4F6] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm bg-white rounded-[28px] shadow-[0_24px_60px_rgba(0,0,0,0.14)] p-8 sm:p-10">
        {children}
      </div>
    </div>
  );
}
