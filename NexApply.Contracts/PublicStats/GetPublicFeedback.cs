using MediatR;
using NexApply.Contracts.Common;

namespace NexApply.Contracts.PublicStats;

public record GetPublicFeedbackQuery : IRequest<Result<List<PublicFeedbackDto>>>;

public record PublicFeedbackDto(
    string StudentName,
    string Role,
    string Testimonial
);
