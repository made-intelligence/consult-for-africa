import Vision
import CoreImage
import AppKit

// Person segmentation at the accurate setting; writes the mask as a greyscale PNG
// at the source size, so compositing happens in Python.
let args = CommandLine.arguments
let input = URL(fileURLWithPath: args[1]), output = URL(fileURLWithPath: args[2])
let ci = CIImage(contentsOf: input)!
let req = VNGeneratePersonSegmentationRequest()
req.qualityLevel = .accurate
req.outputPixelFormat = kCVPixelFormatType_OneComponent8
try VNImageRequestHandler(ciImage: ci).perform([req])
guard let mask = req.results?.first?.pixelBuffer else { print("no person"); exit(1) }
var m = CIImage(cvPixelBuffer: mask)
m = m.transformed(by: CGAffineTransform(scaleX: ci.extent.width / m.extent.width, y: ci.extent.height / m.extent.height))
try CIContext().writePNGRepresentation(of: m, to: output, format: .L8, colorSpace: CGColorSpaceCreateDeviceGray())
print("ok", m.extent)
