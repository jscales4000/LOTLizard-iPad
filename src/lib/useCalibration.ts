import { useState, useCallback } from 'react'

export interface CalibrationPoint {
  x: number
  y: number
}

export interface CalibrationLine {
  start: CalibrationPoint
  end: CalibrationPoint
  pixelDistance: number
  realWorldDistance?: number
  unit?: string
}

export interface CalibrationState {
  isActive: boolean
  isWaitingForFirstPoint: boolean
  isWaitingForSecondPoint: boolean
  isEditing: boolean
  showPopup: boolean
  line: CalibrationLine | null
  scale: number // pixels per unit
}

export const useCalibration = () => {
  const [calibrationState, setCalibrationState] = useState<CalibrationState>({
    isActive: false,
    isWaitingForFirstPoint: false,
    isWaitingForSecondPoint: false,
    isEditing: false,
    showPopup: false,
    line: null,
    scale: 1
  })

  const startCalibration = useCallback(() => {
    setCalibrationState({
      isActive: true,
      isWaitingForFirstPoint: true,
      isWaitingForSecondPoint: false,
      isEditing: false,
      showPopup: false,
      line: null,
      scale: 1
    })
  }, [])

  const setFirstPoint = useCallback((point: CalibrationPoint) => {
    setCalibrationState(prev => ({
      ...prev,
      isWaitingForFirstPoint: false,
      isWaitingForSecondPoint: true,
      line: {
        start: point,
        end: point,
        pixelDistance: 0
      }
    }))
  }, [])

  const setSecondPoint = useCallback((point: CalibrationPoint) => {
    setCalibrationState(prev => {
      if (!prev.line) return prev
      
      const pixelDistance = Math.sqrt(
        Math.pow(point.x - prev.line.start.x, 2) + 
        Math.pow(point.y - prev.line.start.y, 2)
      )
      
      return {
        ...prev,
        isWaitingForSecondPoint: false,
        showPopup: true,
        line: {
          ...prev.line,
          end: point,
          pixelDistance
        }
      }
    })
  }, [])

  const updateCalibration = useCallback((realWorldDistance: number, unit: string) => {
    setCalibrationState(prev => {
      if (!prev.line) return prev
      
      const scale = prev.line.pixelDistance / realWorldDistance
      
      return {
        ...prev,
        showPopup: false,
        line: {
          ...prev.line,
          realWorldDistance,
          unit
        },
        scale
      }
    })
  }, [])

  const editCalibration = useCallback(() => {
    setCalibrationState(prev => ({
      ...prev,
      isEditing: true,
      showPopup: false
    }))
  }, [])

  const updateCalibrationLine = useCallback((start: CalibrationPoint, end: CalibrationPoint) => {
    setCalibrationState(prev => {
      if (!prev.line) return prev
      
      const pixelDistance = Math.sqrt(
        Math.pow(end.x - start.x, 2) + 
        Math.pow(end.y - start.y, 2)
      )
      
      const scale = prev.line.realWorldDistance 
        ? pixelDistance / prev.line.realWorldDistance 
        : 1
      
      return {
        ...prev,
        line: {
          ...prev.line,
          start,
          end,
          pixelDistance
        },
        scale
      }
    })
  }, [])

  const saveCalibration = useCallback(() => {
    setCalibrationState(prev => ({
      ...prev,
      isActive: false,
      isEditing: false,
      showPopup: false
    }))
  }, [])

  const resetCalibration = useCallback(() => {
    setCalibrationState({
      isActive: false,
      isWaitingForFirstPoint: false,
      isWaitingForSecondPoint: false,
      isEditing: false,
      showPopup: false,
      line: null,
      scale: 1
    })
  }, [])

  const cancelCalibration = useCallback(() => {
    setCalibrationState(prev => ({
      ...prev,
      isActive: false,
      isWaitingForFirstPoint: false,
      isWaitingForSecondPoint: false,
      showPopup: false
    }))
  }, [])

  return {
    calibrationState,
    startCalibration,
    setFirstPoint,
    setSecondPoint,
    updateCalibration,
    editCalibration,
    updateCalibrationLine,
    saveCalibration,
    resetCalibration,
    cancelCalibration
  }
}
