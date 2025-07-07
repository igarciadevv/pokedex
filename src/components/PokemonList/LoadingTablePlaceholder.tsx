export default function LoadingTablePlaceholder() {
  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <div className="bg-gray-50 px-6 py-4 border-b font-medium text-sm text-gray-700 grid grid-cols-9 gap-4">
        <div>ID</div>
        <div>Imagen</div>
        <div className="col-span-2">Nombre</div>
        <div>Gen</div>
        <div className="col-span-2">Tipos</div>
        <div className="col-span-2">Stats</div>
      </div>

      <div className="px-6">
        <div className="space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="grid grid-cols-9 gap-4 items-center py-3 animate-pulse">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-12 w-12 bg-gray-200 rounded"></div>
              <div className="col-span-2 h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-12"></div>
              <div className="col-span-2 flex gap-2">
                <div className="h-6 w-16 bg-gray-200 rounded"></div>
                <div className="h-6 w-16 bg-gray-200 rounded"></div>
              </div>
              <div className="col-span-2 grid grid-cols-2 gap-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

