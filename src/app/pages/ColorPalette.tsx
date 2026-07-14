export default function ColorPalette() {
  const colors = [
    {
      category: "Primary Colors",
      items: [
        { name: "Primary Blue", hex: "#2563a8", usage: "Buttons, active states, links" },
        { name: "Hover Blue", hex: "#1e4a8a", usage: "Button hover states" },
        { name: "Sidebar Navy", hex: "#1e3a5f", usage: "Sidebar background" },
      ]
    },
    {
      category: "Backgrounds",
      items: [
        { name: "Page Background", hex: "#f4f6f8", usage: "Main content area" },
        { name: "White", hex: "#ffffff", usage: "Cards, headers", border: true },
      ]
    },
    {
      category: "Grays",
      items: [
        { name: "Border Gray", hex: "#d1d5db", usage: "Borders (gray-300)" },
        { name: "Light Gray", hex: "#e5e7eb", usage: "Inactive buttons (gray-200)" },
        { name: "Medium Gray", hex: "#6b7280", usage: "Secondary text (gray-600)" },
        { name: "Dark Gray", hex: "#374151", usage: "Primary text (gray-700)" },
        { name: "Hover Gray", hex: "#f3f4f6", usage: "Subtle hover (gray-100)" },
      ]
    },
    {
      category: "Status Colors",
      items: [
        { name: "Success Green", hex: "#10b981", usage: "Active/Approved (green-500)" },
        { name: "Warning Orange", hex: "#f59e0b", usage: "Pending (orange-500)" },
        { name: "Error Red", hex: "#ef4444", usage: "Overdue/alerts (red-500)" },
        { name: "Inactive Gray", hex: "#9ca3af", usage: "Inactive (gray-400)" },
      ]
    },
    {
      category: "Accent Colors",
      items: [
        { name: "Blue Badge BG", hex: "#dbeafe", usage: "Supervisor badges (blue-100)" },
        { name: "Blue Badge Text", hex: "#1e40af", usage: "Badge text (blue-700)" },
        { name: "Gray Badge BG", hex: "#f3f4f6", usage: "Student badges (gray-100)" },
        { name: "Gray Badge Text", hex: "#374151", usage: "Badge text (gray-700)" },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-[#f4f6f8] p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm mb-8">
          {/* Renamed brand text from "PMS" to full name */}
          <h1 className="text-3xl mb-2">Project Management System Color Palette</h1>
          <p className="text-gray-600">University Project Management System - Design System Colors</p>
        </div>

        <div className="space-y-8">
          {colors.map((section) => (
            <div key={section.category} className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <h2 className="text-xl mb-6 text-gray-800">{section.category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {section.items.map((color) => (
                  <div key={color.name} className="space-y-3">
                    {/* Circle Display */}
                    <div className="flex items-center gap-4">
                      <div
                        className="w-16 h-16 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: color.hex,
                          border: color.border ? '1px solid #d1d5db' : 'none'
                        }}
                      ></div>
                      <div className="flex-1">
                        <div className="text-gray-800">{color.name}</div>
                        <div className="text-sm text-gray-500 font-mono">{color.hex}</div>
                      </div>
                    </div>

                    {/* Rectangle Display */}
                    <div
                      className="w-full h-12 rounded-md"
                      style={{
                        backgroundColor: color.hex,
                        border: color.border ? '1px solid #d1d5db' : 'none'
                      }}
                    ></div>

                    <div className="text-sm text-gray-600">{color.usage}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
