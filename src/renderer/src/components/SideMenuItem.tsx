import { Link } from "react-router"
// extend props of li element
interface Props extends React.LiHTMLAttributes<HTMLLIElement> {
  to?: string
  children: React.ReactNode
}
export default function SideMenuItem({to, children, ...rest}: Props) {
  return (
    <li {...rest}>
      {to ? (
        <Link
          className="flex gap-4 text-zinc-900 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-100 items-center py-3 px-5 font-medium transition duration-300"
          to={to}
          viewTransition
        >
          {children}
        </Link>
      ) : (
        <button type="button" className="flex gap-4 text-zinc-900 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-100 items-center py-3 px-5 font-medium transition duration-300">
          {children}
        </button>
      )}
      
    </li>
  )
}