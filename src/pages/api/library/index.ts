import connect from 'src/lib/mongodb'
import { NextApiRequest, NextApiResponse } from 'next/types'
import GeneralLibrary from 'src/models/generalLibrary'
import MyLibrary from 'src/models/myLibrary'
import mongoose from 'mongoose'

interface Exercise {
  _id: {
    $oid: string
  }
  exerciseName: string
  muscleGroup: string
  avatar: string
  linkExercise: string
}
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connect()

  try {
    if (req.method === 'POST') {
      const exerciseLibrary = await GeneralLibrary.create(req.body)
      if (exerciseLibrary) {
        return res.status(200).json(exerciseLibrary)
      } else {
        return res.status(404).json('No se pudo crear la libreria de ejercicios')
      }
    } else if (req.method === 'GET') {
      const { id } = req.query
      const generalLibrary = await GeneralLibrary.findOne({}, { exercises: 1 })
      const myLibrary = await MyLibrary.findOne({ trainerId: id }, { exercises: 1, exercisesDeleted: 1 })
      console.log(myLibrary)
      const exerciseGeralLibrary = generalLibrary.exercises
      let response
      if (myLibrary) {
        const exerciseMyLibrary = myLibrary.exercises
        const combinedLibrary = exerciseGeralLibrary.concat(exerciseMyLibrary)
        const excludedExerciseIds = myLibrary.exercisesDeleted
        console.log(excludedExerciseIds)
        response = combinedLibrary.filter((exercise: Exercise) => {
          return !excludedExerciseIds.includes(exercise._id.toString())
        })
        console.log(response)
      } else {
        response = exerciseGeralLibrary
      }

      const responseData = {
        exercisesData: response
      }

      return res.status(200).json(responseData)
    } else if (req.method === 'PUT') {
      const { trainerId, exerciseId } = req.body
      const objectId = new mongoose.Types.ObjectId(exerciseId)
      let pushDeletedExercise = await MyLibrary.findOne({ trainerId: trainerId })
      if (pushDeletedExercise) {
        pushDeletedExercise.exercisesDeleted.push(objectId)
        pushDeletedExercise.save()
      } else {
        pushDeletedExercise = await MyLibrary.create({ trainerId, exercisesDeleted: [objectId] })
      }
      if (pushDeletedExercise) {
        return res.status(200).json(pushDeletedExercise)
      } else {
        return res.status(404).json('No se pudo eliminar el ejercicio')
      }
    } else {
      return res.status(405).json({ error: 'Method Not Allowed' })
    }
  } catch (error) {
    console.error('Error:', error)

    return res.status(500).json({ error: 'Internal Server Error' })
  }
}
