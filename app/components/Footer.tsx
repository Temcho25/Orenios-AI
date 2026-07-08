export default function Footer() {
  return (
    <footer className="border-t border-gray-200 py-12">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6">

        <div>
          <h3 className="text-xl font-bold text-black">
            Orenios AI
          </h3>

          <p className="mt-2 text-gray-500">
            Your Life Admin
          </p>
        </div>

        <div className="flex gap-8 text-gray-500">

          <a href="#">Privacy</a>

          <a href="#">Terms</a>

          <a href="#">Contact</a>

        </div>

      </div>
    </footer>
  );
}