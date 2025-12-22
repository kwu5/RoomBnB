import { PROPERTY_CATEGORIES } from '@/types'

interface CategoriesProps {
  selectedCategory?: string
  onSelectCategory: (categoryId: string) => void
}

export default function Categories({
  selectedCategory,
  onSelectCategory,
}: CategoriesProps) {
  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="max-w-[2520px] mx-auto px-4 sm:px-6 lg:px-20">
        <div className="flex items-center gap-8 overflow-x-auto py-4 scrollbar-hide">
          {PROPERTY_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={`flex flex-col items-center gap-2 p-3 border-b-2 transition min-w-fit ${
                selectedCategory === category.id
                  ? 'border-gray-900 opacity-100'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <span className="text-2xl">{category.icon}</span>
              <span className="text-xs font-medium whitespace-nowrap">
                {category.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
