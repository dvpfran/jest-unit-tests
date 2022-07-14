import { render, screen } from '@testing-library/react';
import { stripe } from '../../services/stripe';
import Posts, { getStaticProps } from '../../pages/posts';
import { getPrismicClient } from '../../services/prismic';

const posts = [
  {
    slug: 'slug-post',
    title: 'title-post',
    excerpt: 'excerpt-post',
    updateAt: '2022-07-13'
  }
];

jest.mock('../../services/prismic');

describe('Posts page', () => {
  it('renders correctly', () => {
    render(
      <Posts posts={posts} />
    )

    expect(screen.getByText("title-post")).toBeInTheDocument();
  });

  it('loads initial data', async () => {
    const getPrimiscClientMocked = jest.mocked(getPrismicClient);

    getPrimiscClientMocked.mockReturnValueOnce({
      query: jest.fn().mockResolvedValueOnce({
        results: [
          {
            uid: 'slug-post',
            data: {
              title: [{type: 'heading', text: 'title-post'}],
              content: [{type: 'paragraph', text: 'excerpt-post'}],
            },
            last_publication_date: '2022-07-13'
          }
        ]
      })
    } as any);

    const response = await getStaticProps({});
    expect(response).toEqual(
      expect.objectContaining({
        props: {
          posts: [{
            slug: 'slug-post',
            title: 'title-post',
            excerpt: 'excerpt-post',
            updatedAt: '13 de julho de 2022'
          }]
        }
      })
    )
  });
});