// // not currently in use
// const { Drive:DriveListDrive } = require('drivelist')
// const sdk = require('etcher-sdk')
// const { cleanupTmpFiles } = require('etcher-sdk/build/tmp')
// const ipc = require('node-ipc')
// const { totalmem } = require('os')
// const { toJSON } = require('../../shared/errors')
// const { GENERAL_ERROR, SUCCESS } = require('../../shared/exit-codes')
// const { delay } = require('../../shared/utils')
// const { SourceOptions } = require('../app/components/source-selector/source-selector')

// ipc.config.id = process.env.IPC_CLIENT_ID
// ipc.config.socketRoot = process.env.IPC_SOCKET_ROOT

// // NOTE: Ensure this isn't disabled, as it will cause
// // the stdout maxBuffer size to be exceeded when flashing
// ipc.config.silent = true

// // > If set to 0, the client will NOT try to reconnect.
// // See https://github.com/RIAEvangelist/node-ipc/
// //
// // The purpose behind this change is for this process
// // to emit a "disconnect" event as soon as the GUI
// // process is closed, so we can kill this process as well.
// // @ts-ignore (0 is a valid value for stopRetrying and is not the same as false)
// ipc.config.stopRetrying = 0

// const DISCONNECT_DELAY = 100
// const IPC_SERVER_ID = process.env.IPC_SERVER_ID

// /**
//  * @summary Send a log debug message to the IPC server
//  */
// function log(message) {
// 	ipc.of[IPC_SERVER_ID].emit('log', message)
// }

// /**
//  * @summary Terminate the child writer process
//  */
// function terminate(exitCode) {
// 	ipc.disconnect(IPC_SERVER_ID)
// 	process.nextTick(() => {
// 		process.exit(exitCode || SUCCESS)
// 	})
// }

// /**
//  * @summary Handle a child writer error
//  */
// async function handleError(error) {
// 	ipc.of[IPC_SERVER_ID].emit('error', toJSON(error))
// 	await delay(DISCONNECT_DELAY)
// 	terminate(GENERAL_ERROR)
// }


// /**
//  * @summary writes the source to the destinations and valiates the writes
//  * @param {SourceDestination} source - source
//  * @param {SourceDestination[]} destinations - destinations
//  * @param {Boolean} verify - whether to validate the writes or not
//  * @param {Boolean} autoBlockmapping - whether to trim ext partitions before writing
//  * @param {Function} onProgress - function to call on progress
//  * @param {Function} onFail - function to call on fail
//  * @returns {Promise<{ bytesWritten, devices, errors} >}
//  */
// async function writeAndValidate({
// 	source,
// 	destinations,
// 	verify,
// 	autoBlockmapping,
// 	decompressFirst,
// 	onProgress,
// 	onFail,
// }) {
// 	const {
// 		sourceMetadata,
// 		failures,
// 		bytesWritten,
// 	} = await sdk.multiWrite.decompressThenFlash({
// 		source,
// 		destinations,
// 		onFail,
// 		onProgress,
// 		verify,
// 		trim: autoBlockmapping,
// 		numBuffers: Math.min(
// 			2 + (destinations.length - 1) * 32,
// 			256,
// 			Math.floor(totalmem() / 1024 ** 2 / 8),
// 		),
// 		decompressFirst,
// 	})
// 	const result = {
// 		bytesWritten,
// 		devices: {
// 			failed: failures.size,
// 			successful: destinations.length - failures.size,
// 		},
// 		errors: [],
// 		sourceMetadata,
// 	}
// 	for (const [destination, error] of failures) {
// 		const err = error
// 		err.device = (destination).device
// 		result.errors.push(err)
// 	}
// 	return result
// }

// ipc.connectTo(IPC_SERVER_ID, () => {
// 	// Remove leftover tmp files older than 1 hour
// 	cleanupTmpFiles(Date.now() - 60 * 60 * 1000)
// 	process.once('uncaughtException', handleError)

// 	// Gracefully exit on the following cases. If the parent
// 	// process detects that child exit successfully but
// 	// no flashing information is available, then it will
// 	// assume that the child died halfway through.

// 	process.once('SIGINT', () => {
// 		terminate(SUCCESS)
// 	})

// 	process.once('SIGTERM', () => {
// 		terminate(SUCCESS)
// 	})

// 	// The IPC server failed. Abort.
// 	ipc.of[IPC_SERVER_ID].on('error', () => {
// 		terminate(SUCCESS)
// 	})

// 	// The IPC server was disconnected. Abort.
// 	ipc.of[IPC_SERVER_ID].on('disconnect', () => {
// 		terminate(SUCCESS)
// 	})

// 	ipc.of[IPC_SERVER_ID].on('write', async (options) => {
// 		/**
// 		 * @summary Progress handler
// 		 * @param {Object} state - progress state
// 		 * @example
// 		 * writer.on('progress', onProgress)
// 		 */
// 		const onProgress = (state) => {
// 			ipc.of[IPC_SERVER_ID].emit('state', state)
// 		}

// 		let exitCode = SUCCESS

// 		/**
// 		 * @summary Abort handler
// 		 * @example
// 		 * writer.on('abort', onAbort)
// 		 */
// 		const onAbort = async () => {
// 			log('Abort')
// 			ipc.of[IPC_SERVER_ID].emit('abort')
// 			await delay(DISCONNECT_DELAY)
// 			terminate(exitCode)
// 		}

// 		ipc.of[IPC_SERVER_ID].on('cancel', onAbort)

// 		/**
// 		 * @summary Failure handler (non-fatal errors)
// 		 * @param {SourceDestination} destination - destination
// 		 * @param {Error} error - error
// 		 * @example
// 		 * writer.on('fail', onFail)
// 		 */
// 		const onFail = (
// 			destination,
// 			error,
// 		) => {
// 			ipc.of[IPC_SERVER_ID].emit('fail', {
// 				// TODO: device should be destination
// 				// @ts-ignore (destination.drive is private)
// 				device: destination.drive,
// 				error: toJSON(error),
// 			})
// 		}

// 		const destinations = options.destinations.map((d) => d.device)
// 		log(`Image: ${options.imagePath}`)
// 		log(`Devices: ${destinations.join(', ')}`)
// 		log(`Umount on success: ${options.unmountOnSuccess}`)
// 		log(`Validate on success: ${options.validateWriteOnSuccess}`)
// 		log(`Auto blockmapping: ${options.autoBlockmapping}`)
// 		log(`Decompress first: ${options.decompressFirst}`)
// 		const dests = options.destinations.map((destination) => {
// 			return new sdk.sourceDestination.BlockDevice({
// 				drive: destination,
// 				unmountOnSuccess: options.unmountOnSuccess,
// 				write: true,
// 				direct: true,
// 			})
// 		})
// 		const { SourceType } = options
// 		let source
// 		if (SourceType === sdk.sourceDestination.File.name) {
// 			source = new sdk.sourceDestination.File({
// 				path: options.imagePath,
// 			})
// 		} else {
// 			source = new sdk.sourceDestination.Http({
// 				url: options.imagePath,
// 				avoidRandomAccess: true,
// 			})
// 		}
// 		try {
// 			const results = await writeAndValidate({
// 				source,
// 				destinations: dests,
// 				verify: options.validateWriteOnSuccess,
// 				autoBlockmapping: options.autoBlockmapping,
// 				decompressFirst: options.decompressFirst,
// 				onProgress,
// 				onFail,
// 			})
// 			log(`Finish: ${results.bytesWritten}`)
// 			results.errors = results.errors.map((error) => {
// 				return toJSON(error)
// 			})
// 			ipc.of[IPC_SERVER_ID].emit('done', { results })
// 			await delay(DISCONNECT_DELAY)
// 			terminate(exitCode)
// 		} catch (error) {
// 			log(`Error: ${error.message}`)
// 			exitCode = GENERAL_ERROR
// 			ipc.of[IPC_SERVER_ID].emit('error', toJSON(error))
// 		}
// 	})

// 	ipc.of[IPC_SERVER_ID].on('connect', () => {
// 		log(
// 			`Successfully connected to IPC server: ${IPC_SERVER_ID}, socket root ${ipc.config.socketRoot}`,
// 		)
// 		ipc.of[IPC_SERVER_ID].emit('ready', {})
// 	})
// })