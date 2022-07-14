import { render, screen } from '@testing-library/react';
import { getSession, useSession } from 'next-auth/client';
import { useRouter } from 'next/router';
import Post, { getStaticProps } from '../../pages/posts/preview/[slug]';
import { getServerSideProps } from '../../pages/posts/[slug]';
import { getPrismicClient } from '../../services/prismic';

const post = {
  slug: 'slug-post',
  title: 'title-post',
  content: '<p>excerpt-post</p>',
  updateAt: '2022-07-13'
};

jest.mock('next-auth/client');
jest.mock('next/router');
jest.mock('../../services/prismic');

describe('Posts preview page', () => {
  it('renders correctly', () => {
    const useSessionMocked = jest.mocked(useSession);
    useSessionMocked.mockReturnValueOnce([null, false]);
    
    render(
      <Post post={post} />
    )

    expect(screen.getByText("title-post")).toBeInTheDocument();
    expect(screen.getByText("excerpt-post")).toBeInTheDocument();
    expect(screen.getByText("Wanna continue reading?")).toBeInTheDocument();
  });

  it('redirects user to full post when user is subscribed', async() => {
    const useSessionMocked = jest.mocked(useSession);
    const useRouterMocked = jest.mocked(useRouter);
    const pushMock = jest.fn();

    useSessionMocked.mockReturnValueOnce([
      { activeSubscription: 'fake-active-subscription' },
      false
    ] as any);

    useRouterMocked.mockReturnValueOnce({
      push: pushMock
    } as any);

    render(
      <Post post={post} />
    )

    expect(pushMock).toHaveBeenCalledWith('/posts/slug-post');
    
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

    const response = await getStaticProps({ params: { slug: 'slug-post' } });

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
