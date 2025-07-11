import Image from "next/image";
import Logo from "@/src/components/design/headerLogo";
import AuthBg from "@/public/images/auth-bg.svg";
import Pattern2 from "@/public/images/Pattern-2.svg";
import Pattern3 from "@/public/images/Pattern-3.svg";
import Pattern5 from "@/public/images/Pattern-4.svg";
import Pattern7 from "@/public/images/Pattern-7.svg";
import Pattern8 from "@/public/images/Pattern-8.svg";
import Link from "next/link"

const patterns = [Pattern2, Pattern3, Pattern5, Pattern7, Pattern8]
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="absolute z-30 w-full">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between md:h-20">
            {/* Site branding */}
            <div className="mr-4 shrink-0">
              <Link href="/" className="shadow hover:bg-gray-900" >
                <Logo />
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      <main className="relative flex grow">
        <div
          className="pointer-events-none absolute bottom-0 left-0 -translate-x-1/3"
          aria-hidden="true"
        >
          <div className="h-80 w-80 rounded-full bg-gradient-to-tr from-blue-500 opacity-70 blur-[160px]"></div>
        </div>

        {/* Content */}
        <div className="w-full">
          <div className="flex h-full flex-col justify-center before:min-h-[4rem] before:flex-1 after:flex-1 md:before:min-h-[5rem]">
            <div className="px-4 sm:px-6">
              <div className="mx-auto w-full max-w-sm">
                <div className="py-16 md:py-20">{children}</div>
              </div>
            </div>
          </div>
        </div>

        <>
          {/* Right side */}
          <div className="relative my-6 mr-6 hidden w-[572px] shrink-0 overflow-hidden rounded-2xl lg:block">
            {/* Background */}
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 -z-10 -ml-24 -translate-x-1/2 -translate-y-1/2 bg-blue-50"
              aria-hidden="true"
            >
              <Image
                src={patterns[(Math.floor(Math.random() * patterns.length))]} 
                className="max-w-none"
                width={1285}
                height={1684}
                alt="Auth bg"
              />
            </div>
            {/* Illustration */}
            <div className="absolute left-32 top-1/2 w-[500px] -translate-y-1/2">
              {/* <div className="aspect-video w-full rounded-2xl bg-gray-900 px-5 py-3 shadow-xl transition duration-300">
                <div className="relative mb-8 flex items-center justify-between before:block before:h-[9px] before:w-[41px] before:bg-[length:16px_9px] before:[background-image:radial-gradient(circle_at_4.5px_4.5px,_theme(colors.gray.600)_4.5px,_transparent_0)] after:w-[41px]">
                  <span className="text-[13px] font-medium text-white">
                    services.code
                  </span>
                </div>
                <div className="font-mono text-sm text-gray-500 transition duration-300 [&_span]:opacity-0">
                  <span className="animate-[code-1_10s_infinite] text-gray-200">
                    smp login
                  </span>{" "}
                  <span className="animate-[code-2_10s_infinite]">
                    --registry=https://pkg.services.codes
                  </span>
                  <br />
                  <span className="animate-[code-3_10s_infinite]">
                    --scope=@auth
                  </span>{" "}
                  <span className="animate-[code-4_10s_infinite]">
                    Successfully logged-in.
                  </span>
                  <br />
                  <br />
                  <span className="animate-[code-5_10s_infinite] text-gray-200">
                    smp app publish
                  </span>
                  <br />
                  <span className="animate-[code-6_10s_infinite]">
                    Client Package published.
                  </span>
                </div>
              </div> */}
            </div>
          </div>
        </>
      </main>
    </>
  );
}
