/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getUser = /* GraphQL */ `
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      name
      email
      images {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const listUsers = /* GraphQL */ `
  query ListUsers(
    $filter: ModelUserFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listUsers(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        email
        createdAt
        updatedAt
        owner
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getUserImage = /* GraphQL */ `
  query GetUserImage($id: ID!) {
    getUserImage(id: $id) {
      id
      url
      bodyShape
      skinTone
      user {
        id
        name
        email
        createdAt
        updatedAt
        owner
        __typename
      }
      generatedImages {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      userImagesId
      owner
      __typename
    }
  }
`;
export const listUserImages = /* GraphQL */ `
  query ListUserImages(
    $filter: ModelUserImageFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listUserImages(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        url
        bodyShape
        skinTone
        createdAt
        updatedAt
        userImagesId
        owner
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getApparel = /* GraphQL */ `
  query GetApparel($id: ID!) {
    getApparel(id: $id) {
      id
      name
      category
      imageUrl
      generatedImages {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const listApparels = /* GraphQL */ `
  query ListApparels(
    $filter: ModelApparelFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listApparels(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        category
        imageUrl
        createdAt
        updatedAt
        owner
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getGeneratedImage = /* GraphQL */ `
  query GetGeneratedImage($id: ID!) {
    getGeneratedImage(id: $id) {
      id
      userImage {
        id
        url
        bodyShape
        skinTone
        createdAt
        updatedAt
        userImagesId
        owner
        __typename
      }
      apparel {
        id
        name
        category
        imageUrl
        createdAt
        updatedAt
        owner
        __typename
      }
      generatedUrl
      createdAt
      updatedAt
      userImageGeneratedImagesId
      apparelGeneratedImagesId
      owner
      __typename
    }
  }
`;
export const listGeneratedImages = /* GraphQL */ `
  query ListGeneratedImages(
    $filter: ModelGeneratedImageFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listGeneratedImages(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        generatedUrl
        createdAt
        updatedAt
        userImageGeneratedImagesId
        apparelGeneratedImagesId
        owner
        __typename
      }
      nextToken
      __typename
    }
  }
`;
