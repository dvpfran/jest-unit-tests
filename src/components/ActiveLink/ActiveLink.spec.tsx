import { render } from '@testing-library/react';
import { ActiveLink } from '.';

jest.mock('next/router', () => {
  return {
    useRouter() {
      return {
        asPath: '/'
      };
    }
  };
});

describe('ActiveLink component', () => {
  it('should renders correctly', () => {
    const { debug, getByText } = render(
      <ActiveLink href='/' activeClassName='active'>
        <a>Home</a>
      </ActiveLink>
    );
  
    // debug();
    expect(getByText('Home')).toBeInTheDocument();
  });
  
  it ('should add active class if the link is currently active', () => {
    const { debug, getByText } = render(
      <ActiveLink href='/' activeClassName='active'>
        <a>Home</a>
      </ActiveLink>
    );
  
    // debug();
    expect(getByText('Home')).toHaveClass('active');
  });
})