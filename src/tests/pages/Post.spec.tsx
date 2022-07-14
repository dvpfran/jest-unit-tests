import { render, screen } from '@testing-library/react';
import { getSession } from 'next-auth/client';
import Post, { getServerSideProps } from '../../pages/posts/[slug]';
import { getPrismicClient } from '../../services/prismic';

const post = {
  slug: 'slug-post',
  title: 'title-post',
  content: '<p>excerpt-post</p>',
  updateAt: '2022-07-13'
};

jest.mock('next-auth/client')
jest.mock('../../services/prismic');

describe('Posts page', () => {
  it('renders correctly', () => {
    render(
      <Post post={post} />
    )

    expect(screen.getByText("title-post")).toBeInTheDocument();
    expect(screen.getByText("excerpt-post")).toBeInTheDocument();
  });

  it('should redirects user if subscription is not found', async () => {
    const getSessionMocked = jest.mocked(getSession);

    getSessionMocked.mockResolvedValueOnce(null);

    const response = await getServerSideProps({
      params: { slug: 'slug-post' } 
    } as any);

    expect(response).toEqual(
      expect.objectContaining({
        redirect: expect.objectContaining({
          destination: '/posts/preview/slug-post'
        })
      })
    )
  });

  it('loads initial data', async () => {
    const getSessionMocked = jest.mocked(getSession);
    const getPrismicClientMocked = jest.mocked(getPrismicClient);

    getPrismicClientMocked.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValueOnce(
          {
              data: {
                  title: [{
                    type: 'heading',
                    text: 'title-post'
                  }],
                  content: [
                      {
                          type: 'paragraph',
                          text: 'excerpt-post',
                      },
                  ],
              },
              last_publication_date: '2022-07-13',
          },
      ),
  } as any);

    getSessionMocked.mockResolvedValueOnce({
      activeSubscription: 'fake-active-sub'
    } as any);

    const response = await getServerSideProps({
      params: { slug: 'slug-post' } 
    } as any);

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          post: {
            slug: 'slug-post',
            title: 'title-post',
            content: '<p>excerpt-post</p>',
            updatedAt: '13 de julho de 2022', 
          }
        }
      })
    )
  });
});