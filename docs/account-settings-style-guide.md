Account Settings UI — Style Guide

Overview
- Context: Dashboard → Settings tab for authenticated users
- Theme: Dark, shadcn UI with Tailwind slate base colors; accent teal/green

Layout
- Page header: title + supporting text stacked; left aligned
- Vertical rhythm: 24px between page sections; 16px within card
- Cards: full-width, rounded corners, subtle border; internal spacing 16–24px

Typography
- Title: `font-serif`, `text-3xl`, `font-bold`
- Section titles: `text-xl` in CardTitle; weight medium
- Body copy: `text-sm` or `text-base` with `text-muted-foreground`

Colors
- Background: `bg-background`
- Foreground: `text-foreground`
- Muted text: `text-muted-foreground`
- Borders: `border-border`
- Primary button: `bg-primary` with `text-primary-foreground`
- Destructive: `bg-destructive`, `text-destructive-foreground`

Components
- Inputs: shadcn Input; full-width; placeholders match examples
- Buttons: default + `variant="destructive"` for delete; loading indicator via `Loader2`
- Cards: shadcn Card with `CardHeader`, `CardContent`, `CardFooter`
- AlertDialog: confirmation for delete (and reuse for global confirms)

Spacing & Radii
- Input height: ~40px (Tailwind default)
- Card corner radius: shadcn default `rounded-lg`
- Button spacing: icon 8px to label when loading

Interactions
- Save Changes: validates required name; updates profile; success toast
- Update Email: RFC 5322-simple email regex; triggers `supabase.auth.updateUser` and updates `profiles.email`; success toast about verification
- Update Password: min 8 chars; match confirm; success toast
- Delete Account: opens modal; destructive confirm; signs out; toast

Accessibility
- Labels associated with inputs via `htmlFor`
- Error messaging via toasts and `aria-invalid` on inputs
- Dialog content labeled with title/description; keyboard focus trapped
- Color contrast meets WCAG 2.1 AA via theme tokens

Responsive
- Cards stack vertically with `md:grid-cols-2` used for paired fields
- No horizontal overflow on small screens; inputs are full-width