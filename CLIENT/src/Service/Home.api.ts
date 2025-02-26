import { MoviePopular } from 'src/Types/Home.type'
import axiosInstance from 'src/Utils'

const apiKey = '799bdcfc9b828c172e9309f3d7f25711'

const getMoviePopular = (page: number) => {
  return axiosInstance.get<MoviePopular>(`movie/popular?api_key=${apiKey}&language=en-US&page=${page}`)
}

export default getMoviePopular
