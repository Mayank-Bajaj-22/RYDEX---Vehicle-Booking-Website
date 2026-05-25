import { configureStore } from '@reduxjs/toolkit'
import userReducer from "./userSlice"

export const store = configureStore({
    reducer: {
        user: userReducer
    },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch

//  reducer ke andar saari slices rakhte hai and slices ke andar data store hota hai
//  reducer ek type ke function hote hai jo sara kaam perform karte hai
//  for access data we use -> useSelector
//  to out data in store we use dispatch