import { Navbar } from 'flowbite-react';
import { useRouter } from 'next/router';
import { useWalletContext } from '../contexts/Wallet.context';
import { truncate } from '../utils/stringTruncate';

export function Nav() {
  const { connectWallet, disconnectWallet, address } = useWalletContext();

  const router = useRouter();

  return (
    <div>
      <nav className=" fixed w-full z-30">
        <div className="bg-white border-gray-200 px-2 sm:px-4 py-2.5 rounded-xl shadow-xl m-2 container flex flex-wrap justify-between items-center mx-auto">
          <button
            onClick={() => router.push('/')}
            className="flex items-center"
          >
            <img
              src="/pets/pug.svg"
              className="mr-3 h-6 sm:h-9"
              alt="Flowbite Logo"
            />
            <span className="self-center text-xl font-semibold whitespace-nowrap text-gray-700">
              Metapaws
            </span>
          </button>
          <button
            data-collapse-toggle="navbar-default"
            type="button"
            className="inline-flex items-center p-2 ml-3 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 "
            aria-controls="navbar-default"
            aria-expanded="false"
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className="w-6 h-6"
              aria-hidden="true"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clip-rule="evenodd"
              ></path>
            </svg>
          </button>
          <div className="hidden w-full md:block md:w-auto" id="navbar-default">
            <ul className="flex flex-col mt-4 md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium">
              <li>
                <a
                  onClick={() => router.push('/')}
                  className="block py-2 pr-4 pl-3 text-gray-700 border-b border-gray-100 hover:bg-gray-50 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 cursor-pointer"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  onClick={() => router.push('/adopt')}
                  className="block py-2 pr-4 pl-3 text-gray-700 border-b border-gray-100 hover:bg-gray-50 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 cursor-pointer"
                >
                  Collection
                </a>
              </li>
              {!address ? (
                <li>
                  <a
                    onClick={connectWallet}
                    className="block py-2 pr-4 pl-3 text-gray-700 border-b border-gray-100 hover:bg-gray-50 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 cursor-pointer font-bold"
                  >
                    Connect wallet
                  </a>
                </li>
              ) : (
                <>
                  <li>
                    <a
                      onClick={() => router.push('/my-paws')}
                      className="block py-2 pr-4 pl-3 text-gray-700 hover:bg-gray-50 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 cursor-pointer"
                    >
                      My Paws
                    </a>
                  </li>
                  <li>
                    <a
                      onClick={() => router.push('/food')}
                      className="block py-2 pr-4 pl-3 text-gray-700 hover:bg-gray-50 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 cursor-pointer"
                    >
                      My Food
                    </a>
                  </li>
                  <li>
                    <a className="block py-2 pr-4 pl-3 text-gray-700 border-b border-gray-100 hover:bg-gray-50 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 cursor-pointer">
                      {truncate(address!, 10)}
                    </a>
                  </li>
                  <li>
                    <a
                      onClick={disconnectWallet}
                      className="block py-2 pr-4 pl-3 text-gray-700 border-b border-gray-100 hover:bg-gray-50 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 cursor-pointer"
                    >
                      🚪
                    </a>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
}
