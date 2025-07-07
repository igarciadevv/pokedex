import { Link } from 'next-view-transitions';

const Header = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/95 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-6">
        <div className="flex">
          <Link href="/" className="flex gap-4 hover:opacity-90 transition-opacity">
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors cursor-pointer">
              <div className="w-6 h-6 border-2 border-white rounded-full">
                <div className="w-2 h-2 bg-white rounded-full mt-1 ml-1"></div>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">PokéDex</h1>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
