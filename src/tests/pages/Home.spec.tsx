import { render, screen } from '@testing-library/react';
import { stripe } from '../../services/stripe';
import Home, { getStaticProps } from '../../pages';

jest.mock('next/router');
jest.mock('next-auth/client', () => {
  return {
    useSession: () => [null, false]
  }
});
jest.mock('../../services/stripe');

describe('Home page', () => {
  it('renders correctly', () => {
    render(
      <Home product={{ priceId: 'fake-price-id', amount: '$10.00' }} />
    )

    expect(screen.getByText("for $10.00 month")).toBeInTheDocument();
  });

  it('loads initial data', async () => {
    const mockedPricesRetrivied = jest.mocked(stripe.prices.retrieve);

    mockedPricesRetrivied.mockResolvedValueOnce({
      id: 'fake-id',
      unit_amount: 1000,
    } as any);

    const response = await getStaticProps({});
    expect(response).toEqual(
      expect.objectContaining(
        {
          props: {
            product: {
              priceId: 'fake-id',
              amount: '$10.00',
            }
          }
        })
      )
  });
});