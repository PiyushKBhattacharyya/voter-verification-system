export default function Footer() {
  return (
    <footer className="bg-white border-t border-neutral-200 mt-6">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-neutral-500 text-sm mb-3 md:mb-0">
            PollVerify System v1.2.1 • © 2023 Election Systems Inc.
          </div>
          <div className="flex items-center space-x-4">
            <a href="#" className="text-neutral-600 hover:text-primary transition text-sm">Help & Documentation</a>
            <a href="#" className="text-neutral-600 hover:text-primary transition text-sm">Privacy Policy</a>
            <a href="#" className="text-neutral-600 hover:text-primary transition text-sm">Technical Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
