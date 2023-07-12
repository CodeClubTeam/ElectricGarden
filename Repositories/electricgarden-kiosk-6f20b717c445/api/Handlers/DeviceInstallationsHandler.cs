using System.Linq;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Http;
using AzureFunctions.Extensions.Swashbuckle.Attribute;
using KioskApi.Models;
using KioskApi.Persistence;
using KioskApi.Resources;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace KioskApi.Handlers
{
    public class DeviceInstallationsHandler
    {
        private readonly AppDbContext _dbContext;

        public DeviceInstallationsHandler(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [FunctionName("GetAllDeviceInstallations")]
        [ProducesResponseType(typeof(DeviceInstallationResource[]), (int) HttpStatusCode.OK)]
        public async Task<IActionResult> GetAll(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "device-installations")]
            [RequestBodyType(typeof(void), "None")]
            HttpRequest req,
            ILogger log,
            CancellationToken cancellationToken)
        {
            log.LogInformation("GET device-installations");

            var sensors =
                await _dbContext.DeviceInstallations
                    .Select(s => new DeviceInstallationResource
                        {
                            Id = s.Id,
                            Serial = s.Serial,
                            Title = s.Title,
                        }
                    ).ToListAsync(
                        cancellationToken);
            return new OkObjectResult(sensors);
        }

        [FunctionName("GetDeviceInstallation")]
        [ProducesResponseType(typeof(DeviceInstallationResource), (int) HttpStatusCode.OK)]
        public async Task<IActionResult> Get(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "device-installations/{id:int}")]
            [RequestBodyType(typeof(void), "None")]
            HttpRequest req,
            ILogger log,
            int id,
            CancellationToken cancellationToken)
        {
            log.LogInformation($"GET device-installations/{id}");

            var resource =
                await _dbContext.DeviceInstallations
                    .Where(s => s.Id == id)
                    .Select(s => new DeviceInstallationResource
                    {
                        Id = s.Id,
                        Serial = s.Serial,
                        Title = s.Title
                    }).SingleOrDefaultAsync(
                        cancellationToken);
            if (resource == null) return new NotFoundResult();

            return new OkObjectResult(resource);
        }
        
        [FunctionName("PostDeviceInstallation")]
        [ProducesResponseType(typeof(DeviceInstallationResource), (int) HttpStatusCode.Created)]
        public async Task<IActionResult> Post(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "device-installations")]
            [RequestBodyType(typeof(PostDeviceInstallationResource), "installation")]
            PostDeviceInstallationResource post,
            ILogger log,
            CancellationToken cancellationToken)
        {
            log.LogInformation("POST device-installations");

            // poor man's validation. I cannot fathom why asp.net core integration isn't provided out of the box
            // for azure functions like it is with aws lambda! Am I missing something?
            if (string.IsNullOrWhiteSpace(post.Serial))
                return new BadRequestErrorMessageResult("'serial' must be provided");

            if (string.IsNullOrWhiteSpace(post.Title))
                return new BadRequestErrorMessageResult("'title' must be provided");

            if (await _dbContext.DeviceInstallations.AnyAsync(s => s.Serial == post.Serial,
                cancellationToken))
                return new BadRequestErrorMessageResult("'serial' already exists. To update, use PATCH.");

            var install = new DeviceInstallation
            {
                Serial = post.Serial,
                Title = post.Title
            };

            // ReSharper disable once MethodHasAsyncOverloadWithCancellation
            _dbContext.DeviceInstallations.Add(install);

            try
            {
                await _dbContext.SaveChangesAsync(cancellationToken);

                return new CreatedResult($"/api/device-installations/{install.Id}", new
                {
                    install.Id,
                    install.Serial,
                    install.Title
                });
            }
            catch (DbUpdateException ex)
            {
                // TODO: verify is validation error not sql ex
                return new BadRequestObjectResult(ex);
            }
        }

        [FunctionName("PatchDeviceInstallation")]
        [ProducesResponseType(typeof(void), (int) HttpStatusCode.NoContent)]
        public async Task<IActionResult> Patch(
            [HttpTrigger(AuthorizationLevel.Anonymous, "patch", Route = "device-installations/{id:int}")]
            [RequestBodyType(typeof(PatchDeviceInstallationResource), "changes")]
            PatchDeviceInstallationResource patch,
            ILogger log,
            int id,
            CancellationToken cancellationToken)
        {
            log.LogInformation($"PATCH device-installations/{id}");

            var installation =
                await _dbContext.DeviceInstallations
                    .SingleOrDefaultAsync(s => s.Id == id,
                        cancellationToken);
            if (installation == null) return new NotFoundResult();

            if (!string.IsNullOrWhiteSpace(patch.Serial)) installation.Serial = patch.Serial;


            if (!string.IsNullOrWhiteSpace(patch.Title)) installation.Title = patch.Title;

            try
            {
                await _dbContext.SaveChangesAsync(cancellationToken);
            }
            catch (DbUpdateException ex)
            {
                // TODO: verify is validation error not sql ex
                return new BadRequestObjectResult(ex);
            }

            return new NoContentResult();
        }

        [FunctionName("DeleteDeviceInstallation")]
        [ProducesResponseType(typeof(void), (int) HttpStatusCode.NoContent)]
        public async Task<IActionResult> Delete(
            [HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "device-installations/{id:int}")]
            [SwaggerIgnore]
            HttpRequest req,
            ILogger log,
            int id,
            CancellationToken cancellationToken)
        {
            log.LogInformation($"DELETE device-installations/{id}");

            var installation =
                await _dbContext.DeviceInstallations
                    .SingleOrDefaultAsync(s => s.Id == id,
                        cancellationToken);
            if (installation == null) return new NoContentResult();

            if (await _dbContext.Samples.AnyAsync(s => s.InstallationId == id, cancellationToken))
                return new BadRequestErrorMessageResult($"Samples exist for sensor with id: {id}");

            _dbContext.DeviceInstallations.Remove(installation);

            try
            {
                await _dbContext.SaveChangesAsync(cancellationToken);
            }
            catch (DbUpdateException ex)
            {
                // TODO: verify is validation error not sql ex
                return new BadRequestObjectResult(ex);
            }

            return new NoContentResult();
        }
        
        [FunctionName("DeviceInstallationBySerial")]
        [ProducesResponseType(typeof(DeviceInstallationResource), (int) HttpStatusCode.OK)]
        public async Task<IActionResult> FindBySerial(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "device-installations-by-serial/{serial}")]
            [RequestBodyType(typeof(void), "None")]
            HttpRequest req,
            ILogger log,
            string serial,
            CancellationToken cancellationToken)
        {
            log.LogInformation($"GET device-installations/{serial}");

            var sensor =
                await _dbContext.DeviceInstallations
                    .Where(x => x.Serial == serial)
                    .SingleOrDefaultAsync(
                        cancellationToken);
            if (sensor == null) return new NotFoundResult();

            return new LocalRedirectResult($"~/api/device-installations/{sensor.Id}");
        }
    }
}