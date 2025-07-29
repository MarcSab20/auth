import Link from 'next/link'
import clsx from 'clsx'

const baseStyles = {
  solid: 'px-4 py-2 rounded-md shadow text-white text-base bg-black transition duration-200 hover:bg-gray-800 hover:shadow-lg',
  outline: 'group inline-flex items-center justify-center rounded-full py-2 px-4 text-sm focus:outline-hidden',
}

const variantStyles = {
  solid: {
    black: '',
  },
  outline: {
    black: 'ring-black text-gray-700 hover:text-black hover:ring-gray-800 active:bg-gray-100 active:text-gray-600 focus-visible:outline-black focus-visible:ring-gray-300',
    slate: 'ring-slate-200 text-slate-700 hover:text-slate-900 hover:ring-slate-300 active:bg-slate-100 active:text-slate-600 focus-visible:outline-black focus-visible:ring-slate-300',
    white: 'ring-slate-700 text-white hover:ring-slate-500 active:ring-slate-700 active:text-slate-400 focus-visible:outline-white',
  },
}

// Style pour le bouton "spécial" (exemple bouton bleu)
const specialStyle =
  'px-6 py-3 rounded-lg shadow text-white text-lg bg-blue-600 transition duration-200 hover:bg-blue-500'

type ButtonProps = (
  | {
      variant?: 'solid'
      color?: 'black'
    }
  | {
      variant: 'outline'
      color?: keyof typeof variantStyles.outline
    }
) & {
  // Prop pour activer le style spécial
  special?: boolean
} & (
  | Omit<React.ComponentPropsWithoutRef<typeof Link>, 'color'>
  | (Omit<React.ComponentPropsWithoutRef<'button'>, 'color'> & { href?: undefined })
)

export function Button({ className, special, ...props }: ButtonProps) {
  // Valeurs par défaut
  props.variant ??= 'solid'
  props.color ??= 'black'

  const computedClasses = special
    ? specialStyle
    : props.variant === 'solid'
    ? baseStyles.solid
    : clsx(baseStyles.outline, variantStyles.outline[props.color] || '')

  const finalClassName = clsx(computedClasses, className)

  return typeof props.href === 'undefined' ? (
    <button className={finalClassName} {...props} />
  ) : (
    <Link className={finalClassName} {...props} />
  )
}
