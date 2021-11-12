export default function Layout({ children }) {
  return (
    <div className="flex flex-col items-center justify-center py-2 p-6 m-6 text-left border w-96 rounded-xl prose">
      {children}
    </div>
  )
}
