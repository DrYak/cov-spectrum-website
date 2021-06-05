import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { HeaderCountrySelect } from './components/HeaderCountrySelect';
import { HeaderSamplingStrategySelect } from './components/HeaderSamplingStrategySelect';
import { AccountService } from './services/AccountService';
import { HeaderDateRangeSelect } from './components/HeaderDateRangeSelect';
import { ExternalLink } from './components/ExternalLink';
import { AiOutlineGithub } from 'react-icons/ai';
import { FaFilter } from 'react-icons/fa';
import { Button, ButtonVariant } from './helpers/ui';

const letters = [
  { color: 'darkgray', text: 'cov' },
  { color: '#0D4A70', text: 'S' },
  { color: '#245C70', text: 'P' },
  { color: '#3A6E6F', text: 'E' },
  { color: '#67916E', text: 'C' },
  { color: '#AC8D3A', text: 'T' },
  { color: '#CF8B20', text: 'R' },
  { color: '#E08A13', text: 'U' },
  { color: '#F18805', text: 'M' },
];

const Logo = (
  <a href='/' className='flex flex-row items-center hover:no-underline md:mb-0.5'>
    <div>
      {letters.map((l: { color: string; text: string }, i) => (
        <span key={i} style={{ color: l.color, fontWeight: 'bold', fontSize: '1.75rem' }}>
          {l.text}
        </span>
      ))}
    </div>
  </a>
);

const FilterDropdown = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className='relative inline-block text-left'>
      {' '}
      <div>
        <button
          type='button'
          className='border border-gray-300 bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center w-full rounded-md  px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-50 hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-gray-500'
          id='options-menu'
          onClick={() => {
            setOpen(!open);
          }}
        >
          <div className={open ? 'fill-current animate-pulse bg-red' : ''}>
            <FaFilter />
          </div>
        </button>
      </div>
      {open && (
        <div className='origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-xl bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5'>
          <div
            className='py-2 px-4 flex flex-col items-start'
            role='menu'
            aria-orientation='vertical'
            aria-labelledby='options-menu'
          >
            <div className='flex w-full justify-between items-center'>
              <h2>Filter</h2>
              <Button
                variant={ButtonVariant.SECONDARY}
                onClick={() => {
                  setOpen(false);
                }}
              >
                Done
              </Button>
            </div>
            <div className='py-2'>
              <HeaderDateRangeSelect />
            </div>
            <div className='py-2'>
              <HeaderSamplingStrategySelect />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Header = () => {
  const loggedIn = AccountService.isLoggedIn();
  let username = null;
  if (loggedIn) {
    username = AccountService.getUsername();
  }

  const location = useLocation();
  const getButtonClasses = (path?: string): string =>
    `${
      path && location.pathname === path ? 'text-gray-800' : 'text-gray-400 hover:text-gray-800'
    } px-3 mr-4 rounded-md text-sm font-medium`;

  return (
    <>
      <nav className='flex h-full content-center shadow-md z-50 bg-white '>
        <div className='w-full mx-auto px-2 md:px-0 flex content-center'>
          <div className='md:mx-4 w-full justify-between'>
            <div className='w-full h-full flex justify-center md:justify-between items-center'>
              <div id='logo-and-search' className='flex h-full md:flex-row flex-column justify-center'>
                <div id='logo-and-gsid' className='flex flex-column items-center justify-center md:pr-4'>
                  <div>{Logo}</div>
                  <div className='text-xs flex flex-row justify-between space-x-1'>
                    <div className='self-end text-gray-500 text-sm'>Enabled by data from </div>{' '}
                    <ExternalLink url='https://gisaid.org/'>
                      <img src='/img/gisaid.png' alt='GISAID' style={{ height: '20px' }} />{' '}
                    </ExternalLink>
                  </div>
                </div>
                <div className='flex items-center z-20 mt-2 md:mt-0'>
                  <HeaderCountrySelect />
                  <div className='lg:hidden'>
                    <FilterDropdown />
                  </div>
                  <div id='date-range-wrapper' className='hidden lg:block'>
                    <HeaderDateRangeSelect />
                  </div>
                  <div className='hidden lg:block'>
                    <HeaderSamplingStrategySelect />
                  </div>
                </div>
              </div>
              <div id='right-nav-buttons' className='hidden md:block items-center justify-center'>
                <div className='ml-1 flex items-center'>
                  <a
                    className={`${getButtonClasses('/acknowledgements')} hidden lg:block`}
                    href='/acknowledgements'
                  >
                    Acknowledgements
                  </a>
                  <a className={getButtonClasses('/about')} href='/about'>
                    About
                  </a>
                  {username === null ? (
                    <a className={getButtonClasses('/login')} href='/login'>
                      Login
                    </a>
                  ) : (
                    <a
                      className={getButtonClasses()}
                      href='/login?left'
                      onClick={() => {
                        AccountService.logout();
                      }}
                    >
                      Logout {username}
                    </a>
                  )}
                  <div
                    onClick={() =>
                      window.open('https://github.com/cevo-public/cov-spectrum-website', '_blank')
                    }
                  >
                    <AiOutlineGithub
                      className='hidden md:block fill-current hover:text-gray-500 rounded-xl filter shadow-xl cursor-pointer ml-1 lg:ml-8'
                      size={'1.5em'}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Header;
